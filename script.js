// =========================
// SMART CAMPUS DASHBOARD
// Advanced D3.js Version
// =========================

// ---------- Campus Dataset ----------
const campusData = {
    "All Buildings": {
        electricity: [220, 250, 230, 270, 300, 320, 350],
        water: [100, 110, 105, 120, 130, 125, 140],
        wifi: [500, 550, 600, 650, 620, 700, 750],
        attendance: [85, 90, 88, 92, 95, 93, 96],
        co2: [50, 55, 53, 58, 60, 65, 68]
    },
    "Library": {
        electricity: [180, 200, 195, 230, 250, 270, 290],
        water: [80, 85, 90, 88, 95, 100, 110],
        wifi: [420, 450, 470, 500, 520, 540, 560],
        attendance: [90, 92, 93, 94, 95, 94, 95],
        co2: [40, 43, 45, 46, 48, 50, 52]
    },
    "Engineering": {
        electricity: [260, 280, 270, 320, 350, 370, 390],
        water: [120, 125, 130, 135, 145, 150, 155],
        wifi: [600, 630, 650, 680, 700, 730, 760],
        attendance: [82, 84, 85, 86, 88, 87, 88],
        co2: [60, 62, 63, 68, 72, 75, 78]
    },
    "Business": {
        electricity: [160, 170, 165, 180, 190, 200, 210],
        water: [70, 72, 74, 76, 78, 80, 82],
        wifi: [350, 370, 390, 410, 430, 450, 470],
        attendance: [78, 80, 81, 82, 83, 82, 82],
        co2: [35, 37, 36, 39, 40, 42, 43]
    },
    "Science": {
        electricity: [210, 230, 225, 250, 270, 290, 310],
        water: [95, 100, 98, 110, 115, 120, 125],
        wifi: [480, 500, 520, 540, 560, 580, 600],
        attendance: [86, 88, 89, 90, 91, 90, 91],
        co2: [48, 50, 51, 54, 56, 59, 61]
    }
};

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

let selectedBuilding = "All Buildings";

const margin = { top: 30, right: 40, bottom: 55, left: 60 };
const width = 700;
const height = 330;

const tooltip = d3.select("#tooltip");

// ---------- Helper Functions ----------
function latest(data) {
    return data[data.length - 1];
}

function updateKPI(data) {
    document.getElementById("electricityValue").innerHTML = latest(data.electricity) + " kWh";
    document.getElementById("waterValue").innerHTML = latest(data.water) + " L";
    document.getElementById("wifiValue").innerHTML = latest(data.wifi);
    document.getElementById("attendanceValue").innerHTML = latest(data.attendance) + "%";
    document.getElementById("co2Value").innerHTML = latest(data.co2) + " kg";
}

function clearChart(svgId) {
    d3.select(svgId).selectAll("*").remove();
}

function showTooltip(event, html) {
    tooltip
        .style("opacity", 1)
        .html(html)
        .style("left", event.pageX + 12 + "px")
        .style("top", event.pageY - 25 + "px");
}

function hideTooltip() {
    tooltip.style("opacity", 0);
}

// ---------- Sparkline ----------
function drawSparkline(svgId, data) {
    clearChart(svgId);

    const svg = d3.select(svgId)
        .attr("width", 160)
        .attr("height", 55);

    const x = d3.scaleLinear()
        .domain([0, data.length - 1])
        .range([5, 155]);

    const y = d3.scaleLinear()
        .domain([d3.min(data), d3.max(data)])
        .range([45, 8]);

    const line = d3.line()
        .x((d, i) => x(i))
        .y(d => y(d));

    svg.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "#1f77b4")
        .attr("stroke-width", 2.5)
        .attr("d", line);

    svg.append("circle")
        .attr("cx", x(data.length - 1))
        .attr("cy", y(latest(data)))
        .attr("r", 3.5)
        .attr("fill", "#0f766e");
}

// ---------- Line Chart ----------
function drawLineChart(svgId, data, title, yLabel, lineColor, annotationText) {
    clearChart(svgId);

    const svg = d3.select(svgId)
        .attr("width", width)
        .attr("height", height);

    const x = d3.scalePoint()
        .domain(days)
        .range([margin.left, width - margin.right]);

    const y = d3.scaleLinear()
        .domain([0, d3.max(data) * 1.2])
        .range([height - margin.bottom, margin.top]);

    const line = d3.line()
        .x((d, i) => x(days[i]))
        .y(d => y(d));

    svg.append("g")
        .attr("class", "axis")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x));

    svg.append("g")
        .attr("class", "axis")
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(y).ticks(5));

    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height - 12)
        .attr("text-anchor", "middle")
        .attr("fill", "#475569")
        .text("Day");

    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", 18)
        .attr("text-anchor", "middle")
        .attr("fill", "#475569")
        .text(yLabel);

    svg.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", lineColor)
        .attr("stroke-width", 3)
        .attr("d", line);

    svg.selectAll(".line-dot")
        .data(data)
        .enter()
        .append("circle")
        .attr("class", "line-dot")
        .attr("cx", (d, i) => x(days[i]))
        .attr("cy", d => y(d))
        .attr("r", 5)
        .attr("fill", lineColor)
        .on("mouseover", function (event, d) {
            const index = data.indexOf(d);
            showTooltip(event, `<strong>${days[index]}</strong><br>${title}: ${d}`);
        })
        .on("mouseout", hideTooltip);

    // Annotation on highest point
    const maxValue = d3.max(data);
    const maxIndex = data.indexOf(maxValue);

    svg.append("text")
        .attr("class", "annotation")
        .attr("x", x(days[maxIndex]) - 20)
        .attr("y", y(maxValue) - 12)
        .text(annotationText);

    svg.append("line")
        .attr("x1", x(days[maxIndex]))
        .attr("y1", y(maxValue) - 5)
        .attr("x2", x(days[maxIndex]))
        .attr("y2", y(maxValue) + 18)
        .attr("stroke", "#dc2626")
        .attr("stroke-width", 2);
}

// ---------- Attendance Bar Chart ----------
function drawAttendanceChart() {
    clearChart("#attendanceChart");

    const buildingData = Object.keys(campusData)
        .filter(b => b !== "All Buildings")
        .map(b => ({
            building: b,
            attendance: latest(campusData[b].attendance)
        }));

    const svg = d3.select("#attendanceChart")
        .attr("width", width)
        .attr("height", height);

    const x = d3.scaleBand()
        .domain(buildingData.map(d => d.building))
        .range([margin.left, width - margin.right])
        .padding(0.25);

    const y = d3.scaleLinear()
        .domain([0, 100])
        .range([height - margin.bottom, margin.top]);

    svg.append("g")
        .attr("class", "axis")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x));

    svg.append("g")
        .attr("class", "axis")
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(y).ticks(5));

    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", 18)
        .attr("text-anchor", "middle")
        .attr("fill", "#475569")
        .text("Attendance (%)");

    svg.selectAll("rect")
        .data(buildingData)
        .enter()
        .append("rect")
        .attr("x", d => x(d.building))
        .attr("y", d => y(d.attendance))
        .attr("width", x.bandwidth())
        .attr("height", d => height - margin.bottom - y(d.attendance))
        .attr("fill", d => d.building === selectedBuilding ? "#f97316" : "#1f77b4")
        .attr("rx", 5)
        .style("cursor", "pointer")
        .on("mouseover", function (event, d) {
            d3.select(this).attr("opacity", 0.8);
            showTooltip(event, `<strong>${d.building}</strong><br>Attendance: ${d.attendance}%`);
        })
        .on("mouseout", function () {
            d3.select(this).attr("opacity", 1);
            hideTooltip();
        })
        .on("click", function (event, d) {
            selectedBuilding = d.building;
            document.getElementById("selectedBuilding").innerHTML = selectedBuilding;
            renderDashboard();
        });

    svg.selectAll(".bar-label")
        .data(buildingData)
        .enter()
        .append("text")
        .attr("class", "bar-label")
        .attr("x", d => x(d.building) + x.bandwidth() / 2)
        .attr("y", d => y(d.attendance) - 8)
        .attr("text-anchor", "middle")
        .attr("fill", "#334155")
        .attr("font-weight", "bold")
        .text(d => d.attendance + "%");
}

// ---------- Composite Chart ----------
function drawCompositeChart(data) {
    clearChart("#compositeChart");

    const svg = d3.select("#compositeChart")
        .attr("width", width)
        .attr("height", height);

    const x = d3.scaleBand()
        .domain(days)
        .range([margin.left, width - margin.right])
        .padding(0.3);

    const yElectric = d3.scaleLinear()
        .domain([0, d3.max(data.electricity) * 1.2])
        .range([height - margin.bottom, margin.top]);

    const yCO2 = d3.scaleLinear()
        .domain([0, d3.max(data.co2) * 1.3])
        .range([height - margin.bottom, margin.top]);

    svg.append("g")
        .attr("class", "axis")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x));

    svg.append("g")
        .attr("class", "axis")
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(yElectric).ticks(5));

    svg.append("g")
        .attr("class", "axis")
        .attr("transform", `translate(${width - margin.right},0)`)
        .call(d3.axisRight(yCO2).ticks(5));

    svg.append("text")
        .attr("x", margin.left)
        .attr("y", 18)
        .attr("fill", "#69b3a2")
        .attr("font-weight", "bold")
        .text("Electricity Usage (kWh)");

    svg.append("text")
        .attr("x", width - margin.right - 120)
        .attr("y", 18)
        .attr("fill", "#ef4444")
        .attr("font-weight", "bold")
        .text("CO₂ Emissions (kg)");

    svg.selectAll(".composite-bar")
        .data(data.electricity)
        .enter()
        .append("rect")
        .attr("class", "composite-bar")
        .attr("x", (d, i) => x(days[i]))
        .attr("y", d => yElectric(d))
        .attr("width", x.bandwidth())
        .attr("height", d => height - margin.bottom - yElectric(d))
        .attr("fill", "#69b3a2")
        .attr("rx", 5)
        .on("mouseover", function (event, d) {
            const index = data.electricity.indexOf(d);
            showTooltip(event, `<strong>${days[index]}</strong><br>Electricity: ${d} kWh`);
        })
        .on("mouseout", hideTooltip);

    const line = d3.line()
        .x((d, i) => x(days[i]) + x.bandwidth() / 2)
        .y(d => yCO2(d));

    svg.append("path")
        .datum(data.co2)
        .attr("fill", "none")
        .attr("stroke", "#ef4444")
        .attr("stroke-width", 3)
        .attr("d", line);

    svg.selectAll(".co2-dot")
        .data(data.co2)
        .enter()
        .append("circle")
        .attr("class", "co2-dot")
        .attr("cx", (d, i) => x(days[i]) + x.bandwidth() / 2)
        .attr("cy", d => yCO2(d))
        .attr("r", 5)
        .attr("fill", "#ef4444")
        .on("mouseover", function (event, d) {
            const index = data.co2.indexOf(d);
            showTooltip(event, `<strong>${days[index]}</strong><br>CO₂: ${d} kg`);
        })
        .on("mouseout", hideTooltip);
}

// ---------- Render Whole Dashboard ----------
function renderDashboard() {
    const data = campusData[selectedBuilding];

    updateKPI(data);

    drawSparkline("#electricitySparkline", data.electricity);
    drawSparkline("#waterSparkline", data.water);
    drawSparkline("#wifiSparkline", data.wifi);
    drawSparkline("#attendanceSparkline", data.attendance);
    drawSparkline("#co2Sparkline", data.co2);

    drawLineChart(
        "#electricityChart",
        data.electricity,
        "Electricity",
        "Electricity Usage (kWh)",
        "#15803d",
        "Peak Usage"
    );

    drawLineChart(
        "#waterChart",
        data.water,
        "Water",
        "Water Usage (L)",
        "#0284c7",
        "Water Spike"
    );

    drawAttendanceChart();
    drawCompositeChart(data);
}

// ---------- Reset Button ----------
document.getElementById("resetBtn").addEventListener("click", function () {
    selectedBuilding = "All Buildings";
    document.getElementById("selectedBuilding").innerHTML = selectedBuilding;
    renderDashboard();
});

// ---------- Real-Time Update Simulation ----------
setInterval(function () {
    const data = campusData[selectedBuilding];

    data.electricity.push(Math.floor(Math.random() * 80) + 250);
    data.electricity.shift();

    data.water.push(Math.floor(Math.random() * 40) + 100);
    data.water.shift();

    data.wifi.push(Math.floor(Math.random() * 200) + 550);
    data.wifi.shift();

    data.attendance.push(Math.floor(Math.random() * 15) + 82);
    data.attendance.shift();

    data.co2.push(Math.floor(Math.random() * 30) + 50);
    data.co2.shift();

    renderDashboard();
}, 5000);

// ---------- Initial Load ----------
renderDashboard();