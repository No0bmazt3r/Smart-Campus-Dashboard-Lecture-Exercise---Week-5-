import * as d3 from 'd3';
import { days, margin, width, height } from './data.js';
import { showTooltip, hideTooltip } from './utils.js';

const wifiZones = ['North', 'South', 'Library', 'Labs', 'Dorms'];

function buildWifiHeatmapData(data) {
  const zoneWeights = [0.18, 0.2, 0.16, 0.26, 0.2];

  return days.flatMap((day, dayIndex) =>
    wifiZones.map((zone, zoneIndex) => {
      const base = data[dayIndex] * zoneWeights[zoneIndex];
      const wave = 1 + (Math.sin((dayIndex + zoneIndex) * 0.9) + 1) * 0.08;

      return {
        day,
        zone,
        value: Math.round(base * wave),
      };
    })
  );
}

function getContextualAnnotation(title, maxIndex) {
  if (title === 'WiFi Users') {
    return maxIndex >= 4 ? 'Midterm Exam Period Started' : 'Lecture Hall Peak';
  }

  if (title === 'Attendance') {
    return maxIndex >= 4
      ? 'Semester Activity Week'
      : 'Normal Attendance Window';
  }

  if (title === 'Electricity') {
    return maxIndex >= 4 ? 'Lab Equipment Load' : 'Academic Usage Peak';
  }

  if (title === 'Water') {
    return maxIndex >= 4
      ? 'End-of-Week Cleaning Cycle'
      : 'Routine Facility Demand';
  }

  return 'Peak Activity';
}

// Draw sparkline with incremental updates
export function drawSparkline(svgId, data) {
  const svg = d3.select(svgId).attr('width', 160).attr('height', 55);

  const x = d3
    .scaleLinear()
    .domain([0, data.length - 1])
    .range([5, 155]);
  const yMin = d3.min(data);
  const yMax = d3.max(data);
  const y = d3
    .scaleLinear()
    .domain([yMin, yMax === yMin ? yMin + 1 : yMax])
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

  const maxValue = d3.max(data);
  const maxIndex = data.indexOf(maxValue);
  const label = annotationText || getContextualAnnotation(title, maxIndex);

  const ann = svg.selectAll('.annotation-text').data([maxValue]);
  ann.join(
    (enter) =>
      enter
        .append('text')
        .attr('class', 'annotation-text')
        .attr('x', x(days[maxIndex]) - 20)
        .attr('y', y(maxValue) - 12)
        .text(label)
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

  const hint = svg.selectAll('.attendance-hint').data([selectedBuilding]);
  hint.join(
    (enter) =>
      enter
        .append('text')
        .attr('class', 'attendance-hint')
        .attr('x', margin.left)
        .attr('y', 26)
        .attr('fill', '#475569')
        .attr('font-size', 13)
        .text(
          selectedBuilding === 'All Buildings'
            ? 'Click a building bar for drill-down'
            : `Drill-down: Campus > ${selectedBuilding}`
        ),
    (update) =>
      update.text(
        selectedBuilding === 'All Buildings'
          ? 'Click a building bar for drill-down'
          : `Drill-down: Campus > ${selectedBuilding}`
      )
  );
}

export function drawWifiHeatmap(svgId, data, buildingName) {
  const svg = d3.select(svgId).attr('width', width).attr('height', height);
  const heatmapData = buildWifiHeatmapData(data);

  const x = d3
    .scaleBand()
    .domain(days)
    .range([margin.left, width - margin.right])
    .padding(0.08);
  const y = d3
    .scaleBand()
    .domain(wifiZones)
    .range([margin.top + 20, height - margin.bottom])
    .padding(0.12);

  const color = d3
    .scaleSequential()
    .domain([0, d3.max(heatmapData, (d) => d.value)])
    .interpolator(d3.interpolateYlGnBu);

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
      .call(d3.axisLeft(y));
    svg
      .append('text')
      .attr('x', margin.left)
      .attr('y', 18)
      .attr('fill', '#0f172a')
      .attr('font-weight', 'bold')
      .text(
        `WiFi Density Heatmap${buildingName !== 'All Buildings' ? ` - ${buildingName}` : ''}`
      );
  }

  const cells = svg
    .selectAll('rect.heat-cell')
    .data(heatmapData, (d) => `${d.day}-${d.zone}`);
  cells.join(
    (enter) =>
      enter
        .append('rect')
        .attr('class', 'heat-cell')
        .attr('x', (d) => x(d.day))
        .attr('y', (d) => y(d.zone))
        .attr('width', x.bandwidth())
        .attr('height', y.bandwidth())
        .attr('rx', 6)
        .attr('fill', (d) => color(d.value))
        .on('mouseover', function (event, d) {
          d3.select(this).attr('stroke', '#0f172a').attr('stroke-width', 1.2);
          showTooltip(
            event,
            `<strong>${d.zone}</strong><br>${d.day}: ${d.value} active users`
          );
        })
        .on('mouseout', function () {
          d3.select(this).attr('stroke', 'none');
          hideTooltip();
        }),
    (update) =>
      update
        .transition()
        .duration(700)
        .attr('x', (d) => x(d.day))
        .attr('y', (d) => y(d.zone))
        .attr('width', x.bandwidth())
        .attr('height', y.bandwidth())
        .attr('fill', (d) => color(d.value)),
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
  const yAttendance = d3
    .scaleLinear()
    .domain([0, 100])
    .range([height - margin.bottom, margin.top]);
  const yWifi = d3
    .scaleLinear()
    .domain([0, d3.max(data.wifi) * 1.2])
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
      .call(d3.axisLeft(yAttendance).ticks(5));
    svg
      .append('g')
      .attr('class', 'axis y-axis-right')
      .attr('transform', `translate(${width - margin.right},0)`)
      .call(d3.axisRight(yWifi).ticks(5));
    svg
      .append('text')
      .attr('x', margin.left)
      .attr('y', 18)
      .attr('fill', '#69b3a2')
      .attr('font-weight', 'bold')
      .text('Attendance (%)');
    svg
      .append('text')
      .attr('x', width - margin.right - 120)
      .attr('y', 18)
      .attr('fill', '#ef4444')
      .attr('font-weight', 'bold')
      .text('WiFi Users');
  } else {
    svg
      .select('.y-axis-left')
      .transition()
      .duration(700)
      .call(d3.axisLeft(yAttendance).ticks(5));
    svg
      .select('.y-axis-right')
      .transition()
      .duration(700)
      .call(d3.axisRight(yWifi).ticks(5));
  }

  const bars = svg.selectAll('rect.composite-bar').data(data.attendance);
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
          const index = data.attendance.indexOf(d);
          showTooltip(
            event,
            `<strong>${days[index]}</strong><br>Attendance: ${d}%`
          );
        })
        .on('mouseout', hideTooltip)
        .transition()
        .duration(700)
        .attr('y', (d) => yAttendance(d))
        .attr('height', (d) => height - margin.bottom - yAttendance(d)),
    (update) =>
      update
        .transition()
        .duration(700)
        .attr('x', (d, i) => x(days[i]))
        .attr('y', (d) => yAttendance(d))
        .attr('height', (d) => height - margin.bottom - yAttendance(d)),
    (exit) => exit.transition().duration(300).attr('height', 0).remove()
  );

  const lineGen = d3
    .line()
    .x((d, i) => x(days[i]) + x.bandwidth() / 2)
    .y((d) => yWifi(d));
  const wifiPath = svg.selectAll('path.wifi-line').data([data.wifi]);
  wifiPath.join(
    (enter) =>
      enter
        .append('path')
        .attr('class', 'wifi-line')
        .attr('fill', 'none')
        .attr('stroke', '#ef4444')
        .attr('stroke-width', 3)
        .attr('d', lineGen),
    (update) => update.transition().duration(700).attr('d', lineGen)
  );

  const dots = svg.selectAll('circle.wifi-dot').data(data.wifi);
  dots.join(
    (enter) =>
      enter
        .append('circle')
        .attr('class', 'wifi-dot')
        .attr('cx', (d, i) => x(days[i]) + x.bandwidth() / 2)
        .attr('cy', (d) => yWifi(d))
        .attr('r', 0)
        .attr('fill', '#ef4444')
        .on('mouseover', function (event, d) {
          const index = data.wifi.indexOf(d);
          showTooltip(
            event,
            `<strong>${days[index]}</strong><br>WiFi Users: ${d}`
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
        .attr('cx', (d, i) => x(days[i]) + x.bandwidth() / 2)
        .attr('cy', (d) => yWifi(d)),
    (exit) => exit.transition().duration(300).attr('r', 0).remove()
  );

  const legend = svg.selectAll('.composite-legend').data([0]);
  legend.join((enter) =>
    enter
      .append('text')
      .attr('class', 'composite-legend')
      .attr('x', margin.left)
      .attr('y', height - 10)
      .attr('fill', '#475569')
      .attr('font-size', 13)
      .text('Bars: Attendance | Line: WiFi Users')
  );
}
