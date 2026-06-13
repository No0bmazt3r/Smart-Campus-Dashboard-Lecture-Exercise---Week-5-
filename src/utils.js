import * as d3 from 'd3';

// Utility functions shared across modules
export const tooltip = d3.select('#tooltip');

export function showTooltip(event, html) {
  tooltip
    .style('opacity', 1)
    .html(html)
    .style('left', (event.pageX || event.clientX) + 12 + 'px')
    .style('top', (event.pageY || event.clientY) - 25 + 'px');
}

export function hideTooltip() {
  tooltip.style('opacity', 0);
}

export function clearChart(svgSelector) {
  d3.select(svgSelector).selectAll('*').remove();
}
