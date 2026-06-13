import { campusData, startSimulation } from './data.js';
import { updateKPI } from './kpi.js';
import {
  drawSparkline,
  drawLineChart,
  drawAttendanceChart,
  drawWifiHeatmap,
  drawCompositeChart,
} from './charts.js';

let selectedBuilding = 'All Buildings';

function setSelectedBuildingLabel() {
  document.getElementById('selectedBuilding').innerHTML =
    selectedBuilding === 'All Buildings'
      ? 'Campus'
      : `Campus &gt; ${selectedBuilding}`;
}

document.getElementById('resetBtn').addEventListener('click', () => {
  selectedBuilding = 'All Buildings';
  setSelectedBuildingLabel();
  renderDashboard();
});

function getSelectedData() {
  return campusData[selectedBuilding];
}

function renderDashboard() {
  const data = getSelectedData();

  updateKPI(data);

  drawSparkline('#electricitySparkline', data.electricity);
  drawSparkline('#waterSparkline', data.water);
  drawSparkline('#wifiSparkline', data.wifi);
  drawSparkline('#attendanceSparkline', data.attendance);
  drawSparkline('#co2Sparkline', data.co2);

  drawLineChart(
    '#electricityChart',
    data.electricity,
    'Electricity',
    'Electricity Usage (kWh)',
    '#15803d'
  );
  drawLineChart(
    '#waterChart',
    data.water,
    'Water',
    'Water Usage (L)',
    '#0284c7'
  );

  drawAttendanceChart(campusData, selectedBuilding, (building) => {
    selectedBuilding = building;
    setSelectedBuildingLabel();
    renderDashboard();
  });

  drawWifiHeatmap('#wifiHeatmap', data.wifi, selectedBuilding);
  drawCompositeChart(data);
}

// Start simulated streaming updates. Returns controller implemented in data.startSimulation
const simController = startSimulation(
  () => selectedBuilding,
  () => {
    // batch updates: only render what changed
    renderDashboard();
  },
  1000
);

// Initial render
setSelectedBuildingLabel();
renderDashboard();

export { renderDashboard, campusData, simController };
