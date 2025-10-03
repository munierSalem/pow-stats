import { D3Plot } from './D3Plot.js';

export class VertPlot extends D3Plot {
  constructor(args) {
    // grab yFields array, set yField = max field for scaling
    args.yFields = args.yFields || [];
    args.yField = args.yFields[args.yFields.length - 1];
    super(args);

    this.yFields = args.yFields;
  }

  plotLogic(data) {
    const groups = this.g.selectAll(".bar-group")
      .data(data, d => d.slug);

    const exitGroups = groups.exit().remove();
    const exitDelay = 0;

    const groupsEnter = groups.enter()
      .append("g")
      .attr("class", "bar-group")
      .attr("transform", d => `translate(${this.x(d[this.xField])},0)`);

    const groupsMerged = groupsEnter.merge(groups)
      .call(sel => this._attachTooltip(sel))
      .transition().delay(exitDelay).duration(750)
      .attr("transform", d => `translate(${this.x(d[this.xField])},0)`);    
    const transitionDelay = groupsMerged.size() - groupsEnter.size() > 0 ? 750 : 0;

    groupsMerged.each((d, i, nodes) => {
      const g = d3.select(nodes[i]);

      const segments = this.yFields.slice(0, -1).map((field, i) => ({
        d: d,
        y0: +d[field],
        y1: +d[this.yFields[i + 1]],
        cls: field.replace(/_/g, "-")
      }));

      const bars = g.selectAll("rect").data(segments);

      bars.exit().remove();

      bars.transition().delay(exitDelay).duration(transitionDelay)
        .attr("fill", seg => this.color(seg.d))
        .attr("x", 0)
        .attr("width", this.x.bandwidth())
        .attr("y", seg => this.y(seg.y1))
        .attr("height", seg => this.y(seg.y0) - this.y(seg.y1));

      bars.enter().append("rect")
        .attr("class", seg => `bar ${seg.cls}`)
        .attr("fill", seg => this.color(seg.d))
        .attr("x", 0)
        .attr("width", 0)
        .attr("y", seg => this.y(seg.y1))
        .attr("height", seg => this.y(seg.y0) - this.y(seg.y1))
        .transition().delay(exitDelay + transitionDelay).duration(400)
        .attr("width", this.x.bandwidth())

    });
  }
}
