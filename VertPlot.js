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

    const groupsEnter = groups.enter()
      .append("g")
      .attr("class", "bar-group")
      .attr("transform", d => `translate(${this.x(d[this.xField])},0)`);

    // three stacked rects per resort
    groupsEnter.each((d, i, nodes) => {
      const g = d3.select(nodes[i]);

      const segments = this.yFields.slice(0, -1).map((field, i) => ({
        d: d,
        y0: +d[field],
        y1: +d[this.yFields[i + 1]],
        cls: field.replace(/_/g, "-")
      }));

      segments.forEach(seg => {
        if (seg.y1 > seg.y0) {
          g.append("rect")
            .attr("class", `bar ${seg.cls}`)
            .attr("fill", d => this.color(seg.d))
            .attr("x", 0)
            .attr("width", this.x.bandwidth())
            .attr("y", this.y(seg.y1))
            .attr("height", this.y(seg.y0) - this.y(seg.y1));
        }
      });
    });

    groups.exit().remove();
  }
}
