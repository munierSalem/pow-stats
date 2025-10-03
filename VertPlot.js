import { D3Plot } from './D3Plot.js';

const DROP_TOGGLE_DEFAULTS = Object.freeze({
  show: false,
  floatLabel: "Float",
  dropLabel: "Drop",
});

export class VertPlot extends D3Plot {
  constructor(args) {
    // grab yFields array, set yField = max field for scaling
    args.yFields = args.yFields || [];
    args.yField = args.yFields[args.yFields.length - 1];
    super(args);

    this.yFields = args.yFields;
    this.dropBase = false;

    // optionally include toggle to float/drop bars
    const dropToggleArgs = args.dropToggleArgs || {};
    this.dropToggleArgs = { ...DROP_TOGGLE_DEFAULTS, ...dropToggleArgs };
    if (this.dropToggleArgs.show) this._initDropToggle();
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
      .call(sel => this._attachHover(sel))
      .transition().delay(exitDelay).duration(750)
      .attr("transform", d => `translate(${this.x(d[this.xField])},0)`);    
    const transitionDelay = groupsMerged.size() - groupsEnter.size() > 0 ? 750 : 0;

    groupsMerged.each((d, i, nodes) => {
      const g = d3.select(nodes[i]);

      const segments = this.yFields.slice(0, -1).map((field, i) => ({
        d: d,
        y0: +d[field] - (this.dropBase ? +d[this.yFields[0]] : 0),
        y1: +d[this.yFields[i + 1]] - (this.dropBase ? +d[this.yFields[0]] : 0),
        cls: field.replace(/_/g, "-")
      }));

      const bars = g.selectAll("rect").data(segments);

      bars.exit().remove();

      bars.transition().delay(exitDelay).duration(transitionDelay)
        .attr("fill", seg => this.color(seg.d))
        .attr("x", 0)
        .attr("width", this.x.bandwidth())
        .attr("y", seg => this.y(seg.y1))
        .attr("height", seg => Math.max(this.y(seg.y0) - this.y(seg.y1), 0))

      bars.enter().append("rect")
        .attr("class", seg => `bar ${seg.cls}`)
        .attr("fill", seg => this.color(seg.d))
        .attr("x", 0)
        .attr("width", 0)
        .attr("y", seg => this.y(seg.y1))
        .attr("height", seg => Math.max(this.y(seg.y0) - this.y(seg.y1), 0))
        .transition().delay(exitDelay + transitionDelay).duration(400)
        .attr("width", this.x.bandwidth())

    });
  }

  _initDropToggle() {
    // Create (or reuse) drop/float toggle
    let filterDiv = this.filterContainer.select(".drop-toggle");
    if (filterDiv.empty()) {
      filterDiv = this.filterContainer.append("div")
        .attr("class", "filters drop-toggle");
    }

    const options = [
      { label: this.dropToggleArgs.floatLabel, value: false },
      { label: this.dropToggleArgs.dropLabel, value: true }
    ];

    // Render buttons
    const buttons = filterDiv.selectAll(".filter-btn")
      .data(options)
      .join("div")
        .attr("class", d =>
          "filter-btn" + (this.dropBase === d.value ? " active" : " inactive"))
        .style("--btn-color", "#333")
        .text(d => d.label)
        .on("click", (event, d) => {
          filterDiv.selectAll(".filter-btn")
            .classed("active", false)
            .classed("inactive", true);
          d3.select(event.currentTarget)
            .classed("active", true)
            .classed("inactive", false);
          this.dropBase = d.value;
          this.updatePlot();
        });
  }
}
