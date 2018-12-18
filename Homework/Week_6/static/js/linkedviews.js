// Zhongyu Chen, 12455822, zhongyuchen@yahoo.com
// linkedviews.js for drawing the linked views

// global variables
var country_list = ["Albania", "Austria","Belgium",
                    "Bulgaria","Croatia","Czech Rep.","Denmark","Estonia","Finland",
                    "France","Germany","Greece","Hungary","Iceland",
                    "Ireland","Italy","Latvia","Liechtenstein",
                    "Lithuania","Luxembourg","Malta","Montenegro",
                    "Netherlands","Norway","Poland","Portugal",
                    "Romania","Slovakia","Slovenia","Spain","Sweden",
                    "Switzerland"];
var year_range = {
    "min": 2009,
    "max": 2018
};
var current_range = {
    "low": 2009,
    "high": 2018
};
var current_bar = {
    "Country": country_list[0],
    "Value": 6891
};

window.onload = function() {
    readcsv('data/asylum_seekers.csv');
};

function readcsv(filename) {
    // read csv file
    d3.csv(filename).then(function(csvdata) {
        // transform data
        let obj = transformdata(csvdata);
        // use data
        usedata(obj);
    });
}

function usedata(obj) {
    piechart();
    barchart(obj);
}

function barchart(fullobj) {
    let obj = barchartdata(fullobj);

    var margin = {top: 20, right: 20, bottom: 60, left: 55},
        width = 1000 - margin.left - margin.right,
        height = 625 - margin.top - margin.bottom;

    var xScale = d3.scaleBand()
                    .rangeRound([0, width])
                    .padding(0.1),
        xValue = function(d) { return d.Country; },
        xMap = function(d) { return xScale(xValue(d)); };

    var yScale = d3.scaleLinear()
                    .range([height, 0]),
        yValue = function(d) { return d.Value},
        yMap = function(d) { return yScale(yValue(d)); };

    var xAxis = d3.axisBottom(xScale);
    var yAxis = d3.axisLeft(yScale).ticks(10);
    var comma = d3.format(",");

    var svg = d3.select("#barchart").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // initialize tooltip
    var tip = d3.tip()
        .attr('class', 'd3-tip')
        .offset([-10, 0])
        .html(function(d) {
            return "<span style='color:red'>" + d.Country + "</span> " +
                "<strong>"+comma(d.Value)+"</strong>";
        });

    // invoke the tip in the context of the visualization
    svg.call(tip);

    svg.append("text")
        .attr("class", "title")
        .attr("x", (width / 2))
        .attr("y", 0)
        .attr("text-anchor", "middle")
        .style("font-size", "25px")
        .text("Asylum Seekers in Europe");

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")");

    svg.append("g")
        .attr("class", "y axis");
    svg.append("text")
        .attr("transform", "rotate(-90)") // rotate the text!
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("Amount");

    // slider update range
    var slider = create_slider('year-slider');
    slider.noUiSlider.on('update', function (values, handle) {
        // update new time range
        let range = {"low": parseInt(values[0]), "high": parseInt(values[1])};
        current_range.low = range.low;
        current_range.high = range.high;

        // according to the range, sum up the values
        let newobj = sum_range(obj, range);

        // extract country and value from object and put into list
        let list = country_value(newobj);
        // get the range of year for title
        let title_year = get_titleyear(range);

        rangeupdatepie(newobj, fullobj);
        updatebar(list, title_year);
    });

    function updatebar(data, year) {
      xScale.domain(data.map(xValue));
      yScale.domain(
          [(d3.min(data, yValue) - d3.max(data, yValue)) / 20,
              d3.max(data, yValue)]);

      svg.select(".title")
          .text("Asylum Seekers in Europe (" + year + ")");

      svg.select('.x.axis').transition().duration(300).call(xAxis)
          .selectAll("text")
          .attr("y", 15)
            .attr("x", -25)
          .attr("transform", "rotate(-60)");

      svg.select(".y.axis").transition().duration(300).call(yAxis);

      var bars = svg.selectAll(".bar").data(data, xValue);

      bars.exit()
        .transition()
          .duration(300)
        .attr("y", yScale(0))
        .attr("height", height - yScale(0))
        .style('fill-opacity', 1e-6)
        .remove();

      // data that needs DOM = enter() (a set/selection, not an event!)
      bars.enter().append("rect")
        .attr("class", "bar")
        .attr("y", yScale(0))
        .attr("height", height - yScale(0))
              .on("mouseover", tip.show)
      .on("mouseout", tip.hide)
          .on("click", clickupdatepie);

      // the "UPDATE" set:
      bars.transition().duration(300).attr("x", xMap) // (d) is one item from the data array, x is the scale object from above
        .attr("width", xScale.bandwidth()) // constant, so no callback function(d) here
        .attr("y", yMap)
        .attr("height", function(d) { return height - yMap(d); })
            .on("mouseover", tip.show)
      .on("mouseout", tip.hide)
          .on("click", clickupdatepie);
    }

    function clickupdatepie(d) {
        // update current bar
        current_bar.Country = d.Country;
        current_bar.Value = d.Value;

        // update data
        // updatepie(fullobj);
    }
}

function rangeupdatepie(newobj, fullobj) {
    // update current bar
    current_bar.Value = newobj[current_bar.Country];

    // update data
    // updatepie(fullobj);
}

function updatepie(fullobj) {
    // let pielist = updatepiedata(fullobj);
    //
    // var margin = {top: 20, right: 20, bottom: 20, left: 20},
    //     width = 625 - margin.left - margin.right,
    //     height = 625 - margin.top - margin.bottom,
    //     radius = width / 2;
    //
    // var arc = d3.arc()
    //     .outerRadius(radius - 10)
    //     .innerRadius(0);
    // var labelArc = d3.arc()
    //     .outerRadius(radius - 50)
    //     .innerRadius(radius - 50);
    //
    // var pie = d3.pie()
    //     .sort(null)
    //     .value(function(d) {return d.Value});
    //
    // var svg= d3.select("#piechart").append("svg")
    //     .attr("width", width)
    //     .attr("height", height)
    //     .append("g")
    //     .attr("transform", "translate(" + (width/2) + ","+(height/2)+")");
    //
    // var g = svg.selectAll(".arc")
    //     .data(pie(pielist))
    //     .enter()
    //     .append("g").attr("class", "arc");
    //
    // g.append("path")
    //     .attr("d", arc)
    //     .style("fill", "blue");
    //
    // g.append("text")
    //     .attr("transform", function(d) { return "translate(" + labelArc.centroid(d) + ")"; })
    //     .attr("dy", ".35em")
    //     .text(function(d) { return d.Country; });


//     var width = 960,
//     height = 500,
//     radius = Math.min(width, height) / 2;
//
// var color = d3.scale.category20();
//
// var pie = d3.layout.pie()
//     .value(function(d) { return d.apples; })
//     .sort(null);
//
// var arc = d3.svg.arc()
//     .innerRadius(radius - 100)
//     .outerRadius(radius - 20);
//
// var svg = d3.select("body").append("svg")
//     .attr("width", width)
//     .attr("height", height)
//   .append("g")
//     .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");
//
//     d3.tsv("data.tsv", type, function(error, data) {
//       if (error) throw error;
//
//       var path = svg.datum(data).selectAll("path")
//           .data(pie)
//         .enter().append("path")
//           .attr("fill", function(d, i) { return color(i); })
//           .attr("d", arc)
//           .each(function(d) { this._current = d; }); // store the initial angles
//
//       d3.selectAll("input")
//           .on("change", change);
//
//       var timeout = setTimeout(function() {
//         d3.select("input[value=\"oranges\"]").property("checked", true).each(change);
//       }, 2000);
//
//       function change() {
//         var value = this.value;
//         clearTimeout(timeout);
//         pie.value(function(d) { return d[value]; }); // change the value function
//         path = path.data(pie); // compute the new angles
//         path.transition().duration(750).attrTween("d", arcTween); // redraw the arcs
//       }
//     });
//
//     function arcTween(a) {
//       var i = d3.interpolate(this._current, a);
//       this._current = i(0);
//       return function(t) {
//         return arc(i(t));
//       };
//     }
}

function piechart() {
    // updatepie();
}

function updatepiedata(obj) {
    let newobj = {
        "Other": 0
    };
    for (let i = current_range.low; i <= current_range.high; i++) {
        let country = obj[i.toString()][current_bar.Country];

        for (let origin in country) {
            if (newobj.hasOwnProperty(origin) == 0) {
                newobj[origin] = 0;
            }

            newobj[origin] += country[origin];
        }
    }

    let lowest = 0.05;
    for (let origin in newobj) {
        if (origin != "Other" &&
            (newobj[origin] / current_bar.Value) < lowest) {
            newobj["Other"] += newobj[origin];
            delete newobj[origin];
        }
    }

    let list = country_value(newobj);

    return list;
}

function sum_range(obj, range) {
    let newobj = {};
    for (let i = range.low; i <= range.high; i++) {
        let year = obj[i.toString()];
        year.forEach(function(y) {
            if (newobj.hasOwnProperty(y.Country) == 0) {
                newobj[y.Country] = 0;
            }

            newobj[y.Country] += y.Value;
        });
    }

    return newobj;
}

function transformdata(csvdata) {
    let obj = {};
    csvdata.forEach(function(d) {
        if (country_list.includes(d["Country"]) &&
            d["Year"] >= year_range.min &&
            d["Year"] <= year_range.max &&
            isNaN(d["Value"]) == 0) {

            if (obj.hasOwnProperty(d["Year"]) == 0) {
                obj[d["Year"]] = {};
            }

            if (obj[d["Year"]].hasOwnProperty(d["Country"]) == 0) {
                obj[d["Year"]][d["Country"]] = {};
            }

            if (obj[d["Year"]][d["Country"]].hasOwnProperty(d["Origin"]) == 0) {
                obj[d["Year"]][d["Country"]][d["Origin"]] = 0;
            }

            obj[d["Year"]][d["Country"]][d["Origin"]] += parseInt(d["Value"]);
        }
    });

    return obj;
}

function barchartdata(obj) {
    let newobj = {};
    for (var year in obj) {
        for (var country in obj[year]) {
            // sum
            let value = 0;
            for (var origin in obj[year][country]) {
                value += obj[year][country][origin];
            }

            // assign
            if (newobj.hasOwnProperty(year) == 0) {
                newobj[year] = [];
            }

            newobj[year].push({"Country": country, "Value": value});
        }
    }

    return newobj;
}

function country_value(obj) {
    let list = [];
    let keys = Object.keys(obj);
    keys.sort();
    keys.forEach(function(d) {
        list.push({"Country": d, "Value": obj[d]});
    });

    return list;
}

function get_titleyear(range) {
    let title_year;
    if (range.low == range.high) {
        title_year = range.low.toString();
    }
    else {
        title_year = range.low.toString() + " - " + range.high.toString();
    }

    return title_year;
}

function create_slider(id) {
    var slider = document.getElementById(id);

    noUiSlider.create(slider, {
        start: [year_range.min, year_range.max],
        connect: true,
        step: 1,
        tooltips: [wNumb({decimals: 0}),wNumb({decimals: 0})],
        range: {
            'min': year_range.min,
            'max': year_range.max
        }
    });
    return slider;
}