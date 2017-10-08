console.log('js sourced');



window.onload = function () {

  var requestURL = 'https://raw.githubusercontent.com/AlecSands/lol_data_experiment/master/data/data.json';
  var request = new XMLHttpRequest();
  request.open('GET', requestURL);
  request.responseType = 'json';
  request.send();

  var myData = {};

  request.onload = function() {
    myData = request.response;
    console.log(myData);

    console.log('test');

    var treeData =
      {
        "name": "Champions",
        "children": [
          {"name": "Marksman", "children": []},
          {"name": "Support", "children": []},
          {"name": "Tank", "children": []},
          {"name": "Fighter", "children": []},
          {"name": "Assassin", "children": []},
          {"name": "Mage", "children": []}
        ]
      };

    console.log('myData inside .onload:', myData);
    console.log('treeData.children', treeData.children );

    for (var variable in myData.data) {
      var newChild = {"name": variable, "children": []};
      // for (var spell in myData.data[variable].spells) {
      //   console.log('spell:', spell);
      // }
      for (var i = 0; i < myData.data[variable].spells.length; i++) {
        var newSpell = {"name": myData.data[variable].spells[i].name}
        newChild.children.push(newSpell);
      }
      var selectRole = myData.data[variable].tags[0]
      if (selectRole == "Marksman") {
        console.log('match on Marksman');
        treeData.children[0].children.push(newChild);
      } else if (selectRole == "Support") {
        console.log('match on Support');
        treeData.children[1].children.push(newChild);
      } else if (selectRole == "Tank") {
        treeData.children[2].children.push(newChild);
      } else if (selectRole == "Fighter") {
        treeData.children[3].children.push(newChild);
      } else if (selectRole == "Assassin") {
        treeData.children[4].children.push(newChild);
      } else if (selectRole == "Mage") {
        treeData.children[5].children.push(newChild);
      }

    }

    console.log('treeData after loop:', treeData);

    // var treeData =
    //   {
    //     "name": "Top Level",
    //     "children": [
    //       {
    //         "name": "Level 2: A",
    //         "children": [
    //           { "name": "Son of A" },
    //           { "name": "Daughter of A" }
    //         ]
    //       },
    //       { "name": "Level 2: B" }
    //     ]
    //   };

    // Set the dimensions and margins of the diagram
    var margin = {top: 20, right: 90, bottom: 30, left: 90},
        width = 2000 - margin.left - margin.right,
        height = 6000 - margin.top - margin.bottom;

    // append the svg object to the body of the page
    // appends a 'group' element to 'svg'
    // moves the 'group' element to the top left margin
    var svg = d3.select("#container").append("svg")
        .attr("width", width + margin.right + margin.left)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", "translate("
              + margin.left + "," + margin.top + ")");

    console.log('svg:', svg);

    var i = 0,
        duration = 750,
        root;

    // declares a tree layout and assigns the size
    var treemap = d3.tree().size([height, width]);

    // Assigns parent, children, height, depth
    root = d3.hierarchy(treeData, function(d) { return d.children; });
    root.x0 = height / 2;
    root.y0 = 0;

    // Collapse after the second level
    // root.children.forEach(collapse);

    update(root);

    // Collapse the node and all it's children
    function collapse(d) {
      if(d.children) {
        d._children = d.children
        d._children.forEach(collapse)
        d.children = null
      }
    }

    function update(source) {

      // Assigns the x and y position for the nodes
      var treeData = treemap(root);

      // Compute the new tree layout.
      var nodes = treeData.descendants(),
          links = treeData.descendants().slice(1);

      // Normalize for fixed-depth.
      nodes.forEach(function(d){ d.y = d.depth * 180});

      // ****************** Nodes section ***************************

      // Update the nodes...
      var node = svg.selectAll('g.node')
          .data(nodes, function(d) {return d.id || (d.id = ++i); });

      // Enter any new modes at the parent's previous position.
      var nodeEnter = node.enter().append('g')
          .attr('class', 'node')
          .attr("transform", function(d) {
            return "translate(" + source.y0 + "," + source.x0 + ")";
        })
        .on('click', click);

      // Add Circle for the nodes
      nodeEnter.append('circle')
          .attr('class', 'node')
          .attr('r', 1e-6)
          .style("fill", function(d) {
              return d._children ? "lightsteelblue" : "#fff";
          });

      // Add labels for the nodes
      nodeEnter.append('text')
          .attr("dy", ".35em")
          .attr("x", function(d) {
              return d.children || d._children ? -13 : 13;
          })
          .attr("text-anchor", function(d) {
              return d.children || d._children ? "end" : "start";
          })
          .text(function(d) { return d.data.name; });

      // UPDATE
      var nodeUpdate = nodeEnter.merge(node);

      // Transition to the proper position for the node
      nodeUpdate.transition()
        .duration(duration)
        .attr("transform", function(d) {
            return "translate(" + d.y + "," + d.x + ")";
         });

      // Update the node attributes and style
      nodeUpdate.select('circle.node')
        .attr('r', 10)
        .style("fill", function(d) {
            return d._children ? "lightsteelblue" : "#fff";
        })
        .attr('cursor', 'pointer');


      // Remove any exiting nodes
      var nodeExit = node.exit().transition()
          .duration(duration)
          .attr("transform", function(d) {
              return "translate(" + source.y + "," + source.x + ")";
          })
          .remove();

      // On exit reduce the node circles size to 0
      nodeExit.select('circle')
        .attr('r', 1e-6);

      // On exit reduce the opacity of text labels
      nodeExit.select('text')
        .style('fill-opacity', 1e-6);

      // ****************** links section ***************************

      // Update the links...
      var link = svg.selectAll('path.link')
          .data(links, function(d) { return d.id; });

      // Enter any new links at the parent's previous position.
      var linkEnter = link.enter().insert('path', "g")
          .attr("class", "link")
          .attr('d', function(d){
            var o = {x: source.x0, y: source.y0}
            return diagonal(o, o)
          });

      // UPDATE
      var linkUpdate = linkEnter.merge(link);

      // Transition back to the parent element position
      linkUpdate.transition()
          .duration(duration)
          .attr('d', function(d){ return diagonal(d, d.parent) });

      // Remove any exiting links
      var linkExit = link.exit().transition()
          .duration(duration)
          .attr('d', function(d) {
            var o = {x: source.x, y: source.y}
            return diagonal(o, o)
          })
          .remove();

      // Store the old positions for transition.
      nodes.forEach(function(d){
        d.x0 = d.x;
        d.y0 = d.y;
      });

      // Creates a curved (diagonal) path from parent to the child nodes
      function diagonal(s, d) {

        path = `M ${s.y} ${s.x}
                C ${(s.y + d.y) / 2} ${s.x},
                  ${(s.y + d.y) / 2} ${d.x},
                  ${d.y} ${d.x}`

        return path
      }

      // Toggle children on click.
      function click(d) {
        if (d.children) {
            d._children = d.children;
            d.children = null;
          } else {
            d.children = d._children;
            d._children = null;
          }
        update(d);
      }
    }

  }


}

// var svg = d3.select("svg"),
//     width = 960,
//     height = 2000,
//     g = svg.append("g").attr("transform", "translate(40,0)");
//
// var tree = d3.cluster()
//     .size([height, width - 160]);
//
// var stratify = d3.stratify()
//     .parentId(function(d) { return d.id.substring(0, d.id.lastIndexOf(".")); });
//
// d3.csv("https://raw.githubusercontent.com/AlecSands/lol_data_experiment/master/data/test.csv", function(error, data) {
//   if (error) throw error;
//   console.log('data:', data);
//
//   var root = stratify(data)
//       .sort(function(a, b) { return (a.height - b.height) || a.id.localeCompare(b.id); });
//
//   console.log('root:', root);
//
//   tree(root);
//
//   var link = g.selectAll(".link")
//       .data(root.descendants().slice(1))
//     .enter().append("path")
//       .attr("class", "link")
//       .attr("d", function(d) {
//         return "M" + d.y + "," + d.x
//             + "C" + (d.parent.y + 100) + "," + d.x
//             + " " + (d.parent.y + 100) + "," + d.parent.x
//             + " " + d.parent.y + "," + d.parent.x;
//       });
//
//   var node = g.selectAll(".node")
//       .data(root.descendants())
//     .enter().append("g")
//       .attr("class", function(d) { return "node" + (d.children ? " node--internal" : " node--leaf"); })
//       .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; })
//
//   node.append("circle")
//       .attr("r", 2.5);
//
//   node.append("text")
//       .attr("dy", 3)
//       .attr("x", function(d) { return d.children ? -8 : 8; })
//       .style("text-anchor", function(d) { return d.children ? "end" : "start"; })
//       .text(function(d) { return d.id.substring(d.id.lastIndexOf(".") + 1); });
// });
