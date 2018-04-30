var section = d3.select("#content")
              .append("div")
              .attr("id", "interactions-div")
              .attr("class", "section center black tk-futura-pt")
              .attr("style", "position:relative; background-color:#F7F7F7;");

var w = section.node().getBoundingClientRect().width;
var h = 500;

var svg = section.append("svg")
          .attr("width", w)
          .attr("height", h);

var highlight_color_link = "#5c452d";
var highlight_color_node = "#7a9244";
var evil_colors = {"0": "#f7c0bb", "1": "#8690ff"};
var main_colors = {"0": "#f7c0bb", "1": "#acd0f4"};
var first_app_colors = {"1": "#f7c0bb", "2": "#8690ff", "3": "#7fd4c1"};

var char_desc = {
    "GINGY": {"evil": "0", "main": "0", "first_app": "1", "visible": "0"},
    "RAPUNZEL": {"evil": "1", "main": "1", "first_app": "3", "visible": "0"},
    "PRINCE CHARMING": {"evil": "1", "main": "1", "first_app": "2", "visible": "0"},
    "MIRROR": {"evil": "1", "main": "0", "first_app": "1", "visible": "1"},
    "PUSS": {"evil": "0", "main": "1", "first_app": "2", "visible": "0"},
    "GUARD": {"evil": "1", "main": "0", "first_app": "1", "visible": "0"},
    "MERLIN": {"evil": "0", "main": "0", "first_app": "3", "visible": "0"},
    "QUEEN": {"evil": "0", "main": "0", "first_app": "2", "visible": "0"},
    "KING HAROLD": {"evil": "0", "main": "0", "first_app": "2", "visible": "0"},
    "FIONA": {"evil": "0", "main": "1", "first_app": "1", "visible": "1"},
    "DONKEY": {"evil": "0", "main": "1", "first_app": "1", "visible": "1"},
    "ARTIE": {"evil": "0", "main": "1", "first_app": "3", "visible": "0"},
    "SNOW WHITE": {"evil": "0", "main": "0", "first_app": "1", "visible": "0"},
    "SHREK": {"evil": "0", "main": "1", "first_app": "1", "visible": "1"},
    "ROBIN HOOD": {"evil": "1", "main": "0", "first_app": "1", "visible": "1"},
    "FARQUAAD": {"evil": "1", "main": "1", "first_app": "1", "visible": "1"},
    "FAIRY GODMOTHER": {"evil": "1", "main": "1", "first_app": "2", "visible": "0"},
    "PINOCCHIO": {"evil": "0", "main": "0", "first_app": "1", "visible": "0"}
};

d3.json("./data/shrek_all_network.json", function(err, data){
    if (err){throw err};

    var nodes = data["nodes"];
    var edges = data["edges"];
    var charge = -800;

    var simulation = d3.forceSimulation(nodes)
        .force("link", d3.forceLink(edges)
                         .id(function(d,i) {
                             return d.id
                         }))
        .force("charge", d3.forceManyBody().strength(charge))
        .force("center", d3.forceCenter(w/2, h/2));

    nodes = data["nodes"]
        .filter(function(d) { return char_desc[d.id].visible=="1"});
    edges = data["edges"]
        .filter(function(d) { return (char_desc[d.source.id].visible=="1"&&char_desc[d.target.id].visible=="1")});

    var textColor = "#333";
    var highlightColor = "#000";
    var linkColor = "#000";
    var film_names = ["All", "1", "2", "3"];
    var links;
    var circles;
    var films;
    var names;

    function drawNetwork(cur_nodes, cur_edges){
        svg.selectAll("*").remove();

        links = svg.append("g")
            .attr("class", "link")
            .selectAll("line")
            .data(cur_edges)
            .enter()
            .append("line")
            .attr("class", function(d){return "link"+d.source.id.replace(" ", "-")+" "+"link"+d.target.id.replace(" ", "-")})
            .attr("stroke", linkColor);

        circles = svg.append("g")
            .attr("class", "node")
            .selectAll("circle")
            .data(cur_nodes)
            .enter()
            .append("circle")
            .attr("fill", function(d) {return evil_colors[char_desc[d.id].evil]})
            .attr("r", function(d) {return scaleCounts(d.word_count)})
            .attr("id", function(d){return "circle"+d.id.replace(" ", "-");}) 
            .call(d3.drag()
                    .on("start", dragstarted)
                    .on("drag", dragged)
                    .on("end", dragended))
             .on("mouseover", function(d){
                 var name = d3.select(this).attr("id").slice(6);
                 var textObj = d3.select("#text"+name);
                 highlightText(textObj);
                 highlightConnections(name);
             })
             .on("mouseout", function(d){
                 var name = d3.select(this).attr("id").slice(6);
                 var textObj = d3.select("#text"+name);
                 dehighlightText(textObj);
                 dehighlightConnections(name);
             });

        films = svg.append("g")
           .attr("class", "films")
           .selectAll("text")
           .data(film_names)
           .enter()
           .append("text")
           .text(function(d,i){return d;})
           .attr("x", function(d,i){return 20+i*30;})
           .attr("y", 20)
           .attr("fill", textColor)
           .attr("id", function(d){return "film"+d})
           .on("click", function(d){

               var film_sel = d3.select(this).attr("id").slice(4);
               if (film_sel != "All"){
                   var chars = {};
                   for (var k in char_desc){
                       if (char_desc[k].first_app == film_sel) chars[k]=char_desc[k];
                   };
               }else{
                   chars=char_desc;
               }

               for (d in char_desc){
                   char_desc[d].visible = "0";
                   var textObj = d3.select("#text"+d.replace(" ", "-"));
                   var circleObj = d3.select("#circle"+d.replace(" ", "-"));
                   nodes = data["nodes"]
                           .filter(function(d) { return char_desc[d.id].visible=="1"});
                   edges = data["edges"]
                           .filter(function(d) {
                               return (char_desc[d.source.id].visible=="1"&&
                                       char_desc[d.target.id].visible=="1")});
                   drawNetwork(nodes, edges);
               }

               for (d in chars){
                   char_desc[d].visible = "1";
                   var textObj = d3.select("#text"+d.replace(" ", "-"));
                   var circleObj = d3.select("#circle"+d.replace(" ", "-"));
                   nodes = data["nodes"]
                           .filter(function(d) { return char_desc[d.id].visible=="1"});
                   edges = data["edges"]
                           .filter(function(d) {
                               return (char_desc[d.source.id].visible=="1"&&
                                       char_desc[d.target.id].visible=="1")});
                   drawNetwork(nodes, edges);
                   restartSimulationWithNewNodes(nodes, edges);
               }

               drawNetwork(nodes, edges);
               restartSimulationWithNewNodes(nodes, edges);
           });

        names = svg.append("g")
           .attr("class", "names")
           .selectAll("text")
           .data(Object.keys(char_desc))
           .enter()
           .append("text")
           .text(function(d, i){return d;})
           .attr("x", 20)
           .attr("y", function(d, i){return 60+i*18;})
           .attr("fill", textColor)
           .attr("style", function(d){return "opacity:"+(char_desc[d].visible==="1"?"1.0":"0.5")+";";})
           .attr("id", function(d){return "text"+d.replace(" ", "-");})
           .on("mouseover", function(d){
              var name = d3.select(this).attr("id").slice(4);
              var circleObj = d3.select("#circle"+name);
              highlightCircle(circleObj);
           })
           .on("mouseout", function(d){
              var name = d3.select(this).attr("id").slice(4);
              var circleObj = d3.select("#circle"+name);
              dehighlightCircle(circleObj);
           })
           .on("click", function(d){
               char_desc[d].visible = (char_desc[d].visible==="1"?"0":"1");
               var textObj = d3.select("#text"+d.replace(" ", "-"));
               var circleObj = d3.select("#circle"+d.replace(" ", "-"));
               swapTextOpacity(textObj);

               nodes = data["nodes"]
                       .filter(function(d) { return char_desc[d.id].visible=="1"});
               edges = data["edges"]
                       .filter(function(d) {
                           return (char_desc[d.source.id].visible=="1"&&
                                   char_desc[d.target.id].visible=="1")});

               drawNetwork(nodes, edges);
               restartSimulationWithNewNodes(nodes, edges);
           });

    }

    function restartSimulationWithNewNodes(nodes, edges){
        simulation.nodes(nodes)
                  .force("link", d3.forceLink(edges)
                                   .strength(function(d){return Math.max(0.1, 0.1*Math.sqrt(d.weight))}))
                  .force("charge", d3.forceManyBody().strength(charge))
                  .force("center", d3.forceCenter(w/2, h/2));
        simulation.alpha(1).restart();
    }

    drawNetwork(nodes, edges);
    simulation.on("tick", ticked);
    restartSimulationWithNewNodes(nodes, edges);

    function ticked(){
      circles.attr("cx", function(d) { return Math.max(1/4*w, Math.min(d.x, 3/4*w)); })
             .attr("cy", function(d) { return Math.max(0, Math.min(d.y, h)); })

      links.attr("x1", function(d){return Math.max(1/4*w, Math.min(d.source.x, 3/4*w))})
           .attr("x2", function(d){return Math.max(1/4*w, Math.min(d.target.x, 3/4*w))})
           .attr("y1", function(d){return Math.max(0, Math.min(d.source.y, h))})
           .attr("y2", function(d){return Math.max(0, Math.min(d.target.y, h))});
    };

    function highlightCircle(d){
        d.attr("stroke-width", "5")
        .attr("stroke", "#000");
    }

    function dehighlightCircle(d){
        d.attr("stroke-width", "0");
    }

    function highlightConnections(name){
        dc = d3.select("#circle"+name);
        dc.attr("fill", highlight_color_node);

        d3.selectAll(".link"+name)
          .attr("stroke-width", 5)
          .attr("stroke", highlight_color_link);
    }

    function dehighlightConnections(name){
        d3.select("#circle"+name)
          .attr("fill", evil_colors[char_desc[name.replace("-", " ")].evil]);

        d3.selectAll(".link"+name)
          .attr("stroke-width", 1);
    }

    function swapTextOpacity(d, to=null){
        if (to == null){
            d.attr("style", function(d){return "opacity:"+(char_desc[d].visible==="1"?"1.0":"0.5")+";";})
        }else{
            d.attr("style", function(d){return "opacity:"+d;});
        }
    }
    
    function highlightText(d){
        d.attr("fill", highlightColor)
         .attr("style", "font-weight: bold;");
    }

    function dehighlightText(d){
        d.attr("fill", textColor)
         .attr("style", "font-weight: normal");
    }

    function scaleCounts(n){
        return 2*Math.log(+n);
    }

    function dragstarted(d) {
      if (!d3.event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(d) {
        d.fx = d3.event.x;
        d.fy = d3.event.y;
    }


    function dragended(d) {
      if (!d3.event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }
});
