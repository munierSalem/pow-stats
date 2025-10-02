import { D3Plot } from './D3Plot.js';

export class ScatterPlot extends D3Plot {
  constructor(args) {
    super(args);
    this.pointRadius = args.pointRadius || 5;  // default
  }

  plotLogic(filteredData) {
    const circles = this.g.selectAll("circle")
      .data(filteredData, d => d.slug);

    circles.enter().append("circle")
      .attr("class", "scatter-point")
      .attr("r", this.pointRadius)
      .attr("fill", d => this.color(d))
      .attr("stroke", d => this.color(d))
      .attr("stroke-width", 1.5)
      .attr("cx", d => this.x(d[this.xField]))
      .attr("cy", d => this.y(d[this.yField]))
      .call(sel => this._attachTooltip(sel))
      .merge(circles)
      .transition().duration(750)
      .attr("cx", d => this.x(d[this.xField]))
      .attr("cy", d => this.y(d[this.yField]));

    circles.exit().remove();
  }
}
