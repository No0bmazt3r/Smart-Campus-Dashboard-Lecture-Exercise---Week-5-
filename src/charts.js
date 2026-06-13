import * as d3 from 'd3';
import { days, margin, width, height } from './data.js';
import { showTooltip, hideTooltip } from './utils.js';

// Draw sparkline with incremental updates
export function drawSparkline(svgId, data) {
  const svg = d3.select(svgId).attr('width', 160).attr('height', 55);

  const x = d3
    .scaleLinear()
    .domain([0, data.length - 1])
    .range([5, 155]);
  const y = d3
    .scaleLinear()
    .domain([d3.min(data), d3.max(data)])
    .range([45, 8]);

  const line = d3
    .line()
    .x((d, i) => x(i))
    .y((d) => y(d));

  const path = svg.selectAll('path.sparkline').data([data]);
  path.join(
    (enter) =>
      enter
        .append('path')
        .attr('class', 'sparkline')
        .attr('fill', 'none')
        .attr('stroke', '#1f77b4')
        .attr('stroke-width', 2.5)
        .attr('d', line),
    (update) => update.transition().duration(700).attr('d', line)
  );

  const endDot = svg
    .selectAll('circle.spark-end')
    .data([data[data.length - 1]]);
  endDot.join(
    (enter) =>
      enter
        .append('circle')
        .attr('class', 'spark-end')
        .attr('r', 3.5)
        .attr('fill', '#0f766e')
        .attr('cx', x(data.length - 1))
        .attr('cy', y(data[data.length - 1])),
    (update) =>
      update
        .transition()
        .duration(700)
        .attr('cx', x(data.length - 1))
        .attr('cy', y(data[data.length - 1]))
  );
}

export function drawLineChart(
  svgId,
  data,
  title,
  yLabel,
  lineColor,
  annotationText
) {
  const svg = d3.select(svgId).attr('width', width).attr('height', height);

  const x = d3
    .scalePoint()
    .domain(days)
    .range([margin.left, width - margin.right]);
  const y = d3
    .scaleLinear()
    .domain([0, d3.max(data) * 1.2])
    .range([height - margin.bottom, margin.top]);

  const line = d3
    .line()
    .x((d, i) => x(days[i]))
    .y((d) => y(d));

  if (svg.selectAll('.x-axis').empty()) {
    svg
      .append('g')
      .attr('class', 'axis x-axis')
      .attr('transform', `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x));
    svg
      .append('g')
      .attr('class', 'axis y-axis')
      .attr('transform', `translate(${margin.left},0)`)
      .call(d3.axisLeft(y).ticks(5));
    svg
      .append('text')
      .attr('class', 'x-label')
      .attr('x', width / 2)
      .attr('y', height - 12)
      .attr('text-anchor', 'middle')
      .attr('fill', '#475569')
      .text('Day');
    svg
      .append('text')
      .attr('class', 'y-label')
      .attr('transform', 'rotate(-90)')
      .attr('x', -height / 2)
      .attr('y', 18)
      .attr('text-anchor', 'middle')
      .attr('fill', '#475569')
      .text(yLabel);
  } else {
    svg
      .select('.y-axis')
      .transition()
      .duration(700)
      .call(d3.axisLeft(y).ticks(5));
  }

  const path = svg.selectAll('path.line-path').data([data]);
  path.join(
    (enter) =>
      enter
        .append('path')
        .attr('class', 'line-path')
        .attr('fill', 'none')
        .attr('stroke', lineColor)
        .attr('stroke-width', 3)
        .attr('d', line),
    (update) => update.transition().duration(700).attr('d', line)
  );

  const dots = svg.selectAll('circle.line-dot').data(data);
  dots.join(
    (enter) =>
      enter
        .append('circle')
        .attr('class', 'line-dot')
        .attr('cx', (d, i) => x(days[i]))
        .attr('cy', (d) => y(d))
        .attr('r', 0)
        .attr('fill', lineColor)
        .on('mouseover', function (event, d) {
          const index = data.indexOf(d);
          showTooltip(
            event,
            `<strong>${days[index]}</strong><br>${title}: ${d}`
          );
        })
        .on('mouseout', hideTooltip)
        .transition()
        .duration(600)
        .attr('r', 5),
    (update) =>
      update
        .transition()
        .duration(700)
        .attr('cx', (d, i) => x(days[i]))
        .attr('cy', (d) => y(d)),
    (exit) => exit.transition().duration(300).attr('r', 0).remove()
  );

  // Annotation
  const maxValue = d3.max(data);
  const maxIndex = data.indexOf(maxValue);
  const ann = svg.selectAll('.annotation-text').data([maxValue]);
  ann.join(
    (enter) =>
      enter
        .append('text')
        .attr('class', 'annotation-text')
        .attr('x', x(days[maxIndex]) - 20)
        .attr('y', y(maxValue) - 12)
        .text(annotationText)
        .attr('fill', '#dc2626'),
    (update) =>
      update
        .transition()
        .duration(700)
        .attr('x', x(days[maxIndex]) - 20)
        .attr('y', y(maxValue) - 12)
  );

  const annLine = svg.selectAll('.annotation-line').data([maxValue]);
  annLine.join(
    (enter) =>
      enter
        .append('line')
        .attr('class', 'annotation-line')
        .attr('x1', x(days[maxIndex]))
        .attr('y1', y(maxValue) - 5)
        .attr('x2', x(days[maxIndex]))
        .attr('y2', y(maxValue) + 18)
        .attr('stroke', '#dc2626')
        .attr('stroke-width', 2),
    (update) =>
      update
        .transition()
        .duration(700)
        .attr('x1', x(days[maxIndex]))
        .attr('y1', y(maxValue) - 5)
        .attr('x2', x(days[maxIndex]))
        .attr('y2', y(maxValue) + 18)
  );
}

export function drawAttendanceChart(campusData, selectedBuilding, onSelect) {
  const buildingData = Object.keys(campusData)
    .filter((b) => b !== 'All Buildings')
    .map((b) => ({
      building: b,
      attendance: campusData[b].attendance[campusData[b].attendance.length - 1],
    }));
  const svg = d3
    .select('#attendanceChart')
    .attr('width', width)
    .attr('height', height);

  const x = d3
    .scaleBand()
    .domain(buildingData.map((d) => d.building))
    .range([margin.left, width - margin.right])
    .padding(0.25);
  const y = d3
    .scaleLinear()
    .domain([0, 100])
    .range([height - margin.bottom, margin.top]);

  if (svg.selectAll('.x-axis').empty()) {
    svg
      .append('g')
      .attr('class', 'axis x-axis')
      .attr('transform', `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x));
    svg
      .append('g')
      .attr('class', 'axis y-axis')
      .attr('transform', `translate(${margin.left},0)`)
      .call(d3.axisLeft(y).ticks(5));
    svg
      .append('text')
      .attr('class', 'y-label')
      .attr('transform', 'rotate(-90)')
      .attr('x', -height / 2)
      .attr('y', 18)
      .attr('text-anchor', 'middle')
      .attr('fill', '#475569')
      .text('Attendance (%)');
  }

  const bars = svg
    .selectAll('rect.att-bar')
    .data(buildingData, (d) => d.building);
  bars.join(
    (enter) =>
      enter
        .append('rect')
        .attr('class', 'att-bar')
        .attr('x', (d) => x(d.building))
        .attr('y', height - margin.bottom)
        .attr('width', x.bandwidth())
        .attr('height', 0)
        .attr('fill', (d) =>
          d.building === selectedBuilding ? '#f97316' : '#1f77b4'
        )
        .attr('rx', 5)
        .style('cursor', 'pointer')
        .on('mouseover', function (event, d) {
          d3.select(this).attr('opacity', 0.8);
          showTooltip(
            event,
            `<strong>${d.building}</strong><br>Attendance: ${d.attendance}%`
          );
        })
        .on('mouseout', function () {
          d3.select(this).attr('opacity', 1);
          hideTooltip();
        })
        .on('click', function (event, d) {
          if (typeof onSelect === 'function') onSelect(d.building);
        })
        .transition()
        .duration(700)
        .attr('y', (d) => y(d.attendance))
        .attr('height', (d) => height - margin.bottom - y(d.attendance)),
    (update) =>
      update
        .transition()
        .duration(700)
        .attr('x', (d) => x(d.building))
        .attr('y', (d) => y(d.attendance))
        .attr('width', x.bandwidth())
        .attr('height', (d) => height - margin.bottom - y(d.attendance))
        .attr('fill', (d) =>
          d.building === selectedBuilding ? '#f97316' : '#1f77b4'
        ),
    (exit) => exit.transition().duration(300).attr('height', 0).remove()
  );

  const labels = svg
    .selectAll('.bar-label')
    .data(buildingData, (d) => d.building);
  labels.join(
    (enter) =>
      enter
        .append('text')
        .attr('class', 'bar-label')
        .attr('x', (d) => x(d.building) + x.bandwidth() / 2)
        .attr('y', height - margin.bottom)
        .attr('text-anchor', 'middle')
        .attr('fill', '#334155')
        .attr('font-weight', 'bold')
        .text((d) => d.attendance + '%')
        .transition()
        .duration(700)
        .attr('y', (d) => y(d.attendance) - 8),
    (update) =>
      update
        .transition()
        .duration(700)
        .attr('x', (d) => x(d.building) + x.bandwidth() / 2)
        .attr('y', (d) => y(d.attendance) - 8)
        .text((d) => d.attendance + '%'),
    (exit) => exit.remove()
  );
}

export function drawCompositeChart(data) {
  const svg = d3
    .select('#compositeChart')
    .attr('width', width)
    .attr('height', height);

  const x = d3
    .scaleBand()
    .domain(days)
    .range([margin.left, width - margin.right])
    .padding(0.3);
  const yElectric = d3
    .scaleLinear()
    .domain([0, d3.max(data.electricity) * 1.2])
    .range([height - margin.bottom, margin.top]);
  const yCO2 = d3
    .scaleLinear()
    .domain([0, d3.max(data.co2) * 1.3])
    .range([height - margin.bottom, margin.top]);

  if (svg.selectAll('.x-axis').empty()) {
    svg
      .append('g')
      .attr('class', 'axis x-axis')
      .attr('transform', `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x));
    svg
      .append('g')
      .attr('class', 'axis y-axis-left')
      .attr('transform', `translate(${margin.left},0)`)
      .call(d3.axisLeft(yElectric).ticks(5));
    svg
      .append('g')
      .attr('class', 'axis y-axis-right')
      .attr('transform', `translate(${width - margin.right},0)`)
      .call(d3.axisRight(yCO2).ticks(5));
    svg
      .append('text')
      .attr('x', margin.left)
      .attr('y', 18)
      .attr('fill', '#69b3a2')
      .attr('font-weight', 'bold')
      .text('Electricity Usage (kWh)');
    svg
      .append('text')
      .attr('x', width - margin.right - 120)
      .attr('y', 18)
      .attr('fill', '#ef4444')
      .attr('font-weight', 'bold')
      .text('CO₂ Emissions (kg)');
  } else {
    svg
      .select('.y-axis-left')
      .transition()
      .duration(700)
      .call(d3.axisLeft(yElectric).ticks(5));
    svg
      .select('.y-axis-right')
      .transition()
      .duration(700)
      .call(d3.axisRight(yCO2).ticks(5));
  }

  const bars = svg.selectAll('rect.composite-bar').data(data.electricity);
  bars.join(
    (enter) =>
      enter
        .append('rect')
        .attr('class', 'composite-bar')
        .attr('x', (d, i) => x(days[i]))
        .attr('y', height - margin.bottom)
        .attr('width', x.bandwidth())
        .attr('height', 0)
        .attr('fill', '#69b3a2')
        .attr('rx', 5)
        .on('mouseover', function (event, d) {
          const index = data.electricity.indexOf(d);
          showTooltip(
            event,
            `<strong>${days[index]}</strong><br>Electricity: ${d} kWh`
          );
        })
        .on('mouseout', hideTooltip)
        .transition()
        .duration(700)
        .attr('y', (d) => yElectric(d))
        .attr('height', (d) => height - margin.bottom - yElectric(d)),
    (update) =>
      update
        .transition()
        .duration(700)
        .attr('x', (d, i) => x(days[i]))
        .attr('y', (d) => yElectric(d))
        .attr('height', (d) => height - margin.bottom - yElectric(d)),
    (exit) => exit.transition().duration(300).attr('height', 0).remove()
  );

  const lineGen = d3
    .line()
    .x((d, i) => x(days[i]) + x.bandwidth() / 2)
    .y((d) => yCO2(d));
  const co2Path = svg.selectAll('path.co2-line').data([data.co2]);
  co2Path.join(
    (enter) =>
      enter
        .append('path')
        .attr('class', 'co2-line')
        .attr('fill', 'none')
        .attr('stroke', '#ef4444')
        .attr('stroke-width', 3)
        .attr('d', lineGen),
    (update) => update.transition().duration(700).attr('d', lineGen)
  );

  const dots = svg.selectAll('circle.co2-dot').data(data.co2);
  dots.join(
    (enter) =>
      enter
        .append('circle')
        .attr('class', 'co2-dot')
        .attr('cx', (d, i) => x(days[i]) + x.bandwidth() / 2)
        .attr('cy', (d) => yCO2(d))
        .attr('r', 0)
        .attr('fill', '#ef4444')
        .on('mouseover', function (event, d) {
          const index = data.co2.indexOf(d);
          showTooltip(event, `<strong>${days[index]}</strong><br>CO₂: ${d} kg`);
        })
        .on('mouseout', hideTooltip)
        .transition()
        .duration(600)
        .attr('r', 5),
    (update) =>
      update
        .transition()
        .duration(700)
        .attr('cx', (d, i) => x(days[i]) + x.bandwidth() / 2)
        .attr('cy', (d) => yCO2(d)),
    (exit) => exit.transition().duration(300).attr('r', 0).remove()
  );
}
