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
    console.log("here!");
    const groups = this.g.selectAll(".bar-group")
      .data(data, d => d.slug);

    // ENTER groups
    const groupsEnter = groups.enter()
      .append("g")
      .attr("class", "bar-group")
      .attr("transform", d => `translate(${this.x(d[this.xField])},0)`);

    // UPDATE + ENTER merge
    groupsEnter.merge(groups)
      .transition().duration(750)
      .attr("transform", d => `translate(${this.x(d[this.xField])},0)`);

    // EXIT groups
    groups.exit()
      .transition().duration(500)
      .remove();

    // --- Bars inside each group ---
    groupsEnter.each((d, i, nodes) => {
      const g = d3.select(nodes[i]);

      const segments = this.yFields.slice(0, -1).map((field, i) => ({
        d: d,
        y0: +d[field],
        y1: +d[this.yFields[i + 1]],
        cls: field.replace(/_/g, "-")
      }));

      const bars = g.selectAll("rect").data(segments);

      console.log(this.x.bandwidth());

      // ENTER rects
      bars.enter().append("rect")
        .attr("class", seg => `bar ${seg.cls}`)
        .attr("fill", seg => this.color(seg.d))
        .attr("x", 0)
        .attr("width", this.x.bandwidth())
        .attr("y", seg => this.y(seg.y1))
        .attr("height", seg => this.y(seg.y0) - this.y(seg.y1));

      // UPDATE rects
      bars.transition().duration(750)
        .attr("fill", seg => this.color(seg.d))
        .attr("x", 0)
        .attr("width", this.x.bandwidth())
        .attr("y", seg => this.y(seg.y1))
        .attr("height", seg => this.y(seg.y0) - this.y(seg.y1));

      // EXIT rects
      bars.exit()
        .transition().duration(500)
        .remove();
    });
  }
}
