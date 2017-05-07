/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


/*
    Removes the scatter plot
*/

function reset_scatterPlot() {
    d3.select("[id=scatterPlotFigure]").selectAll("svg").remove();
}

/*
    Draws the scatter plot with architecture inputs
    @param source: a JSON object array containing the basic arch info
*/
function draw_scatterPlot(source) {
    
    var margin=ScatterPlot_margin;
    var width=ScatterPlot_width;
    var height=ScatterPlot_height;
    
    
    source.forEach(function (d) {  // convert string to numbers
        d.science = +d.science;
        d.cost = +d.cost;
        if (d.cost == 100000) {
            d.cost = 0;
            d.science = 0;
        }
    });


    // setup x 
    var xValue = function (d) {
        return d.science;
    }; // data -> value
    var xScale = d3.scale.linear().range([0, width]); // value -> display
    
    //
    // don't want dots overlapping axis, so add in buffer to data domain 
    var xBuffer = (d3.max(source, xValue) - d3.min(source, xValue)) * 0.05;
    xScale.domain([d3.min(source, xValue) - xBuffer, d3.max(source, xValue) + xBuffer]);

    var xMap = function (d) {
        return xScale(xValue(d));
    }; // data -> display
    var xAxis = d3.svg.axis().scale(xScale).orient("bottom");

    // setup y
    var yValue = function (d) {
        return d.cost;
    }; // data -> value
    var yScale = d3.scale.linear().range([height, 0]); // value -> display

    var yBuffer = (d3.max(source, yValue) - d3.min(source, yValue)) * 0.05;
    yScale.domain([d3.min(source, yValue) - yBuffer, d3.max(source, yValue) + yBuffer]);

    var yMap = function (d) {
        return yScale(yValue(d));
    }; // data -> display
    var yAxis = d3.svg.axis().scale(yScale).orient("left");
    
    
    ScatterPlot_xScale = xScale;
    ScatterPlot_xMap = xMap;
    ScatterPlot_xAxis = xAxis;
    ScatterPlot_yScale = yScale;
    ScatterPlot_yMap = yMap;
    ScatterPlot_yAxis = yAxis;


    // Create svg
    svg = d3.select("[id=scatterPlotFigure]")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .call(
                d3.behavior.zoom()
                .x(xScale)
                .y(yScale)
                .scaleExtent([0.4, 25])
                .on("zoom", function (d) {

                    svg = d3.select("[id=scatterPlotFigure]")
                            .select("svg");

                    svg.select(".x.axis").call(xAxis);
                    svg.select(".y.axis").call(yAxis);

                    objects.select(".hAxisLine").attr("transform", "translate(0," + yScale(0) + ")");
                    objects.select(".vAxisLine").attr("transform", "translate(" + xScale(0) + ",0)");
                    //d3.event.translate[0]

                    svg.selectAll(".dot.archPlot")
                            .attr("transform", function (d) {
                                var xCoord = xMap(d);
                                var yCoord = yMap(d);
                                return "translate(" + xCoord + "," + yCoord + ")";
                            });
                    
//                    svg.selectAll("[class=paretoFrontier]")
//                            .attr("transform", function (d) {
//                                return "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")";
//                            })
//                            .attr("stroke-width",1.5/d3.event.scale);

                    ScatterPlot_translate = d3.event.translate;
                    ScatterPlot_scale = d3.event.scale;

                })
                )
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // x-axis
    svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis)
            .append("text")
            .attr("class", "label")
            .attr("x", width)
            .attr("y", -6)
            .style("text-anchor", "end")
            .text("Science benefit");

    // y-axis
    svg.append("g")
            .attr("class", "y axis")
            .call(yAxis)
            .append("text")
            .attr("class", "label")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", ".71em")
            .style("text-anchor", "end")
            .text("Cost");

    objects = svg.append("svg")
            .attr("class", "objects")
            .attr("width", width)
            .attr("height", height);

    //Create main 0,0 axis lines:
    objects.append("svg:line")
            .attr("class", "axisLine hAxisLine")
            .attr("x1", 0)
            .attr("y1", 0)
            .attr("x2", width)
            .attr("y2", 0)
            .attr("transform", "translate(0," + (yScale(0)) + ")");
    objects.append("svg:line")
            .attr("class", "axisLine vAxisLine")
            .attr("x1", 0)
            .attr("y1", 0)
            .attr("x2", 0)
            .attr("y2", height)
            .attr("transform", "translate(" + (xScale(0)) + ",0)");

    var dots = objects.selectAll(".dot.archPlot")
            .data(source)
            .enter().append("circle")
            .attr("class", "dot archPlot")
            .attr("r", 3.8)
            .attr("transform", function (d) {
                var xCoord = xMap(d);
                var yCoord = yMap(d);
                return "translate(" + xCoord + "," + yCoord + ")";
            })
            .style("fill", defaultColor);

    dots.on("mouseover", arch_mouseover);
    dots.on('mouseout', arch_mouseout);

    
    // Initialize all tabs
    initialize_tabs();


    d3.select("#scatterPlotFigure").on("click",unhighlight_support_panel);
    d3.select("#supportPanel").on("click",highlight_support_panel);
    
    // Set button click operations
	d3.selectAll("[id=getDrivingFeaturesButton]").on("click", runDataMining);
    d3.select("[id=selectArchsWithinRangeButton]").on("click", selectArchsWithinRange);
    d3.select("[id=cancel_selection]").on("click",cancelDotSelections);
    d3.select("[id=hide_selection]").on("click",hideSelection);
    d3.select("[id=show_all_archs]").on("click",show_all_archs);
    d3.select("[id=openFilterOptions]").on("click",openFilterOptions);
    
    d3.select("[id=numOfArchs_inputBox]").text(""+numOfArchs());
    d3.selectAll(".dot.archPlot")[0].forEach(function(d,i){
        d3.select(d).attr("paretoRank",-1);
    });
    
    
    
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //Experiment
    
    if(testType=="1"){

        d3.select("#tab2").text('-');
        d3.select("#view2").selectAll('g').remove();
        d3.select("#tab3").text('-');
        d3.select("#view3").selectAll('g').remove();

        d3.select('#panel_2').remove();

        d3.select(d3.select('body').selectAll('div')[0][1]).style('width','1400px').style('margin','auto');

    }else if(testType=="2"){

        

    }else {

        // Do nothing

    }
    
    update_task_direction();
    
    //calculateParetoRanking();
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    
    
    
    //drawParetoFront();
    
    selection_changed = true;
    
}




function add_newArchs_to_scatterPlot() {
    for (var i = 0; i < newArchs.length; i++) {
        architectures.push(newArchs[i]);
    }
    reset_scatterPlot();
    draw_scatterPlot(architectures);
}



function selectArchsWithinRange() {
	
    var clickedArchs = d3.selectAll(".dot.archPlot.selected");
    var unClickedArchs = d3.selectAll(".dot.archPlot:not(.selected)");

    var minCost = d3.select("[id=selectArchsWithinRange_minCost]")[0][0].value;
    var maxCost = d3.select("[id=selectArchsWithinRange_maxCost]")[0][0].value;
    var minScience = d3.select("[id=selectArchsWithinRange_minScience]")[0][0].value;
    var maxScience = d3.select("[id=selectArchsWithinRange_maxScience]")[0][0].value;

    if (maxCost == "inf") {
        maxCost = 1000000000000;
    }

    unClickedArchs.filter(function (d) {

        var sci = d.science;
        var cost = d.cost;

        if (sci < minScience) {
            return false;
        } else if (sci > maxScience) {
            return false;
        } else if (cost < minCost) {
            return false;
        } else if (cost > maxCost) {
            return false;
        } else {
            return true;
        }
    })
    .classed('selected',true)
    .style("fill", selectedColor);

    clickedArchs.filter(function (d) {

        var sci = d.science;
        var cost = d.cost;

        if (sci < minScience) {
            return true;
        } else if (sci > maxScience) {
            return true;
        } else if (cost < minCost) {
            return true;
        } else if (cost > maxCost) {
            return true;
        } else {
            return false;
        }
    })
    .classed('selected',false)
    .style("fill",defaultColor);

    d3.select("[id=numOfSelectedArchs_inputBox]").text(""+numOfSelectedArchs());
    selection_changed = true;
    initialize_tabs_driving_features();
    initialize_tabs_classification_tree();
}



/*
   Removes selections and/or highlights in the scatter plot
   @param option: option to remove all selections and highlights or remove only highlights
*/
function cancelDotSelections(option){
    
    if(option==null){
        // Remove both highlights and selections
        d3.selectAll(".dot.archPlot")
            .classed('selected',false)
            .classed('highlighted',false)
            .style("fill",defaultColor);
        
    }else if(option=='remove_selection'){
        // Remove only selection only
        d3.selectAll('.dot.archPlot.selected')[0].forEach(function(d){
            var dot = d3.select(d);
            dot.classed('selected',false);
            if(dot.classed('highlighted')){
                // selected and highlighted
                dot.style("fill", highlightedColor);
            }else{
                // selected
                dot.style("fill",defaultColor);
            }
        })
        
        // Selection is changed, so initialize
        selection_changed = true;
        initialize_tabs_driving_features();
        initialize_tabs_classification_tree();
        

    }else if(option=='remove_highlighted'){
        // Remove only highlights
        d3.selectAll('.dot.archPlot.highlighted')[0].forEach(function(d){
            var dot = d3.select(d);
            dot.classed('highlighted',false);
            if(dot.classed('selected')){
                dot.style("fill", selectedColor);
            }else{
                dot.style("fill",defaultColor);
            }
        })
    }else{
        
        selection_changed = true;
        initialize_tabs_driving_features();
        initialize_tabs_classification_tree();
    }
    
    // Reset the number of selected archs displayed
    d3.select("[id=numOfSelectedArchs_inputBox]").text(""+numOfSelectedArchs());
}





function hideSelection(){

    var clickedArchs = d3.selectAll(".dot.archPlot.selected");

    clickedArchs.classed('hidden',true)
            .style("opacity", 0.085);
    d3.select("[id=instrumentOptions]")
            .select("table").remove();        
    d3.select("[id=numOfSelectedArchs_inputBox]").text(""+numOfSelectedArchs());
    d3.select("[id=numOfArchs_inputBox]").text(""+numOfArchs());
    selection_changed = true;
    initialize_tabs_driving_features();
    initialize_tabs_classification_tree();
}


function show_all_archs(){

    var hiddenArchs = d3.selectAll(".dot.archPlot.hidden");
    hiddenArchs.classed('hidden',false)
            .classed('selected',false)
            .classed('highlighted',false)
            .style("fill",defaultColor)
            .style("opacity",1);
    
    d3.select("[id=instrumentOptions]")
            .select("table").remove();        
    d3.select("[id=numOfSelectedArchs_inputBox]").text(""+numOfSelectedArchs());
    d3.select("[id=numOfArchs_inputBox]").text(""+numOfArchs());
    selection_changed = true;
    initialize_tabs_driving_features();
    initialize_tabs_classification_tree();
}






function arch_mouseover(d) {
    
    // The support panel is active, disable hovering 
	if(supportPanel_active){
		return;
	}
	
	numOfArchViewed = numOfArchViewed+1;
	
    
    check_satisfied_features(d.bitString);
    
    // Change the color of the dot temporarily
    var id = d.id;
    
    d3.selectAll('.dot.archPlot')[0].forEach(function(d){
        if(d.__data__.id==id){
            d3.select(d).style("fill", defaultColor_mouseover);
        }
    });
    
    // Remove the previous info
    d3.select("#supportPanel").select("[id=view1]").select("g").remove();
    var supportPanel = d3.select("#supportPanel").select("[id=view1]")
            .append("g");

    // Display the current architecture info
    supportPanel.append("p")
            .text("Benefit: " + d.science.toFixed(4));
    supportPanel.append("p")
            .text("Cost: " + d.cost.toFixed(1));
    
    var bitString = booleanArray2String(d.bitString);
    display_arch_info(bitString);
    
    
}


function check_satisfied_features(bitString){
    
    // If the input bitString is not given, use default colors
    if(bitString==null){
        d3.selectAll('.applied_feature')[0].forEach(function(d){
            
            var this_feature = d3.select(d);
            var activated = this_feature.select('.feature_application_activate')[0][0].checked;
            this_feature.select('.feature_application_expression').style("color",function(d){
                if(activated){
                    return "#000000"; //black
                }else{
                    return "#989898"; // gray
                }
            });
        });
        return;
    }
        
    // Selectively highlight features that do not apply to the given bitString
    d3.selectAll('.applied_feature')[0].forEach(function(d){
        var this_feature = d3.select(d);
        var expression = this_feature.select('.feature_application_expression').attr('expression');
        
        if(expression.indexOf('{FeatureToBeAdded}')!=-1){
            return;
        }
        
        if(!applyPresetFilter(expression,bitString)){
            // highlight the feature  
            this_feature.select('.feature_application_expression').style('color','red');            
        }
    });
}


function arch_mouseout(d) {
    var id = d.id;
    d3.selectAll('.dot.archPlot')[0].forEach(function(d){
        if(d.__data__.id==id){
            var dot = d3.select(d);
            if(dot.classed('selected') && dot.classed('highlighted')){
                dot.style('fill',overlapColor);
            }else if(dot.classed('selected')){
                dot.style('fill',selectedColor);  
            }else if(dot.classed('highlighted')){
                dot.style('fill',highlightedColor);
            }else{
                d3.select(d).style("fill", defaultColor);
            }
        }
    });
    check_satisfied_features();
}



function scatterPlot_selection_option(selected_option){ // three options: zoom, drag_selection, drag_deselection

    var margin=ScatterPlot_margin;
    var width=ScatterPlot_width;
    var height=ScatterPlot_height;
    
    var xScale = ScatterPlot_xScale;
    var xMap = ScatterPlot_xMap;
    var xAxis = ScatterPlot_xAxis;
    var yScale = ScatterPlot_yScale;
    var yMap = ScatterPlot_yMap;
    var yAxis = ScatterPlot_yAxis;
    
    if (selected_option=="1"){
        // Zoom
    	
        ScatterPlot_translate_local = ScatterPlot_translate;
        ScatterPlot_scale_local = ScatterPlot_scale;

        var svg_tmp =  d3.select("[id=scatterPlotFigure]")
            .select("svg")
            .on("mousedown",null)
            .on("mousemove",null)
            .on("mouseup",null);

        d3.select("[id=scatterPlotFigure]")
            .select("svg")
            .call(
                d3.behavior.zoom()
                        .x(xScale)
                        .y(yScale)
                        .scaleExtent([0.4, 25])
                        .on("zoom", function (d) {

                            var svg = d3.select("[id=scatterPlotFigure]")
                                    .select("svg");

                            svg.select(".x.axis").call(xAxis);
                            svg.select(".y.axis").call(yAxis);

                            objects.select(".hAxisLine").attr("transform", "translate(0," + yScale(0) + ")");
                            objects.select(".vAxisLine").attr("transform", "translate(" + xScale(0) + ",0)");
                            //d3.event.translate[0]

                            svg.selectAll(".dot.archPlot")
                                    .attr("transform", function (d) {
                                        var xCoord = xMap(d);
                                        var yCoord = yMap(d);
                                        return "translate(" + xCoord + "," + yCoord + ")";
                                    });
                            
                            svg.selectAll("[class=paretoFrontier]")
                                    .attr("transform", function (d) {
                                         var x = ScatterPlot_translate[0]*d3.event.scale + d3.event.translate[0];
                                         var y = ScatterPlot_translate[1]*d3.event.scale + d3.event.translate[1];
                                         var s = d3.event.scale*ScatterPlot_scale;
                                        return "translate(" + x +","+ y + ")scale(" + s + ")";
                                    })
                                     .attr("stroke-width",function(){
                                         return 1.5/(d3.event.scale*ScatterPlot_scale_local);
                                     });

                            ScatterPlot_translate[0] = d3.event.translate[0] + ScatterPlot_translate_local[0]*d3.event.scale;
                            ScatterPlot_translate[1] = d3.event.translate[1] + ScatterPlot_translate_local[1]*d3.event.scale;
                            ScatterPlot_scale = d3.event.scale*ScatterPlot_scale_local;

                        })       
            )  
    } else{
    	
        var option;
        if(selected_option=="2"){
            option = "selection";
        }else{
            option = "deselection";
        }

        var svg_tmp =  d3.select("[id=scatterPlotFigure]")
            .select("svg")
            .call(d3.behavior.zoom().on("zoom",null));

        svg_tmp
            .on( "mousedown", function() {

            	var p = d3.mouse( this);
                svg_tmp.append( "rect")
                        .attr({
                            rx      : 0,
                            ry      : 0,
                            class   : "selection",
                            x       : p[0],
                            y       : p[1],
                            width   : 0,
                            height  : 0,
                            x0      : p[0],
                            y0      : p[1]
                        })
                        .style("background-color", "#EEEEEE")
                        .style("opacity", 0.18);
            
                initialize_tabs_driving_features();
            
            })
            .on( "mousemove", function() {

                var s = svg_tmp.select("rect.selection");
                if( !s.empty()) {
                    var p = d3.mouse( this);

                    var b = {
                        x       : parseInt( s.attr("x"),10),
                        y       : parseInt( s.attr("y"), 10),
                        x0       : parseInt( s.attr("x0"),10),
                        y0       : parseInt( s.attr("y0"), 10),
                        width   : parseInt( s.attr("width"),10),
                        height  : parseInt( s.attr("height"), 10)
                    };
                    var move = {
                        x : p[0] - b.x0,
                        y : p[1] - b.y0
                    };

                    if (move.x < 0){
                        b.x = b.x0 + move.x;

                    } else{
                        b.x = b.x0;
                    }
                    if (move.y < 0){
                        b.y = b.y0 + move.y;
                    } else {
                        b.y = b.y0;
                    }
                    b.width = Math.abs(move.x);
                    b.height = Math.abs(move.y);

                    s.attr(b);

                    if(option=="selection"){ // Make selection
                        
                        d3.selectAll(".dot.archPlot:not(.selected)")[0].forEach(function(d,i){
                            var sci = d.__data__.science;
                            var cost = d.__data__.cost;
                            var xCoord = xScale(sci);
                            var yCoord = yScale(cost);

                            if( 
                                xCoord + margin.left>= b.x && xCoord + margin.left <= b.x+b.width && 
                                yCoord + margin.top >= b.y && yCoord + margin.top  <= b.y+b.height
                            ) {
                                // Select
                                var dot = d3.select(d);
                                dot.classed('selected',true);
                                
                                if(dot.classed('highlighted')){
                                    // highlighted and selected
                                    dot.style("fill", overlapColor);      
                                }else{
                                    // selected but not highlighted
                                    dot.style("fill", selectedColor);      
                                }
                                selection_changed = true;

                            }
                        });
                        
                    }else{	// De-select
                        d3.selectAll(".dot.archPlot.selected")[0].forEach(function(d,i){
                            var sci = d.__data__.science;
                            var cost = d.__data__.cost;
                            var xCoord = xScale(sci);
                            var yCoord = yScale(cost);

                            if( 
                                xCoord + margin.left>= b.x && xCoord + margin.left <= b.x+b.width && 
                                yCoord + margin.top >= b.y && yCoord + margin.top  <= b.y+b.height
                            ) {
                                // Cancel selection
                                var dot = d3.select(d);
                                dot.classed('selected',false);
                                
                                if(dot.classed('highlighted')){
                                    // was selected and highlighted
                                    dot.style("fill", highlightedColor);      
                                }else{
                                    // was not highlighted
                                    dot.style("fill", defaultColor);   
                                }
                                selection_changed = true;
                            }
                        });
                    }
                    d3.select("[id=numOfSelectedArchs_inputBox]").text(""+numOfSelectedArchs());
                }      
            })
            .on( "mouseup", function() {
            
                unhighlight_support_panel();
               // remove selection frame
                d3.select('#scatterPlotFigure').select('svg').selectAll( "rect.selection").remove();
            })
    }               
}


function drawParetoFront(){
    
    var margin=ScatterPlot_margin;
    var width=ScatterPlot_width;
    var height=ScatterPlot_height;
    
    var xScale = ScatterPlot_xScale;
    var xMap = ScatterPlot_xMap;
    var xAxis = ScatterPlot_xAxis;
    var yScale = ScatterPlot_yScale;
    var yMap = ScatterPlot_yMap;
    var yAxis = ScatterPlot_yAxis;


    var archsInParetoFront = d3.selectAll(".dot.archPlot")[0].filter(function(d){
        if(d3.select(d).attr("paretoRank")=="0"){
            return true;
        }
    });

    var sortedScoreList = []; sortedScoreList.length=0;
    var sortedArchList = []; sortedArchList.length=0;

    var size = archsInParetoFront.length;

    for(var i=0;i<size;i++){
        var thisScore = archsInParetoFront[i].__data__.science;
        var tmp = {
                cost: archsInParetoFront[i].__data__.cost,
                sci: archsInParetoFront[i].__data__.science
        };

        if(sortedScoreList.length==0){
            sortedScoreList.push(thisScore);
            sortedArchList.push(tmp);
        }else{
            var sortedLength = sortedScoreList.length;
            for(var j=0;j<sortedLength;j++){
                if(thisScore > sortedScoreList[j]){
                    break;
                }
            }
            sortedScoreList.splice(j, 0, thisScore);
            sortedArchList.splice(j, 0, tmp);
        }
    }

    var lines = []; lines.length=0;
    for (var i=1;i<size;i++){
        var line = {
            x1: xScale(sortedArchList[i-1].sci),
            x2: xScale(sortedArchList[i].sci),
            y1: yScale(sortedArchList[i-1].cost),
            y2: yScale(sortedArchList[i].cost) 
        };
        lines.push(line);
    }

    d3.select("[id=scatterPlotFigure]").select("svg")
            .select("[class=objects]")
            .selectAll("[class=paretoFrontier]")
            .data(lines)
            .enter()
            .append("line")
            .attr("class","paretoFrontier")
            .attr("stroke-width", 1.5)
            .attr("stroke", "#D00F0F")
            .attr("x1",function(d){
                return d.x1;
            })
            .attr("x2",function(d){
                return d.x2;
            })
            .attr("y1",function(d){
                return d.y1;
            })
            .attr("y2",function(d){
                return d.y2;
            });
}




function calculateParetoRanking(){      
    cancelDotSelections();

    var archs = d3.selectAll(".dot.archPlot")[0].filter(function(d){
        if(d3.select(d).attr("paretoRank")=="-1"){
            return true;
        }
    });
    if (archs.length==0){
        return;
    }

    var rank=0;
    while(archs.length > 0){

        var numArchs = archs.length;
        if (rank>15){
            break;
        }

        for (var i=0; i<numArchs; i++){
            var non_dominated = true;
            var thisArch = archs[i];

            for (var j=0;j<numArchs;j++){
                if (i==j) continue;
                if (
                    (thisArch.__data__.science <= archs[j].__data__.science &&
                    thisArch.__data__.cost > archs[j].__data__.cost) || 
                    (thisArch.__data__.science < archs[j].__data__.science &&
                    thisArch.__data__.cost >= archs[j].__data__.cost) 
                ){
                    non_dominated = false;
                }
            }
            if (non_dominated == true){
                d3.select(thisArch).attr("paretoRank",""+rank);
            } 
        }
        archs = d3.selectAll(".dot.archPlot")[0].filter(function(d){
            if(d3.select(d).attr("paretoRank")=="-1"){
                return true;
            }
        });
        rank++;
    }

}


function highlight_support_panel(){

    d3.select("[id=scatterPlotFigure]")
    	.style("border-width","1px");
	d3.select("#supportPanel")
		.style("border-width","3.3px");
	supportPanel_active=true;
}


function unhighlight_support_panel(){

    d3.select("[id=scatterPlotFigure]")
			.style("border-width","3.3px");
	d3.select("#supportPanel")
			.style("border-width","1px");
	supportPanel_active=false;
}


function initialize_tabs(){
    
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Experiment
    initialize_tabs_inspection();
	if(testType=='1'){
        return;
    }
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    
    initialize_tabs_filter_options();
	initialize_tabs_driving_features();
	initialize_tabs_classification_tree();
}


function initialize_tabs_inspection(){
	d3.select("#supportPanel").select("[id=view1]").select("g").remove();
	d3.select("#supportPanel").select("[id=view1]").append("g")
			.append("div")
			.style("width","900px")
			.style("margin","auto")
			.append("div")
			.style("width","100%")
			.style("font-size","21px")
			.text("If you hover the mouse over a design, relevant information will be displayed here.");
}

function initialize_tabs_filter_options(){
    openFilterOptions(); 
}



function initialize_tabs_driving_features(){
	
	if(testType=="1"){
		return;
	}
	
	
	selection_changed=true;
	
	
	d3.select("#supportPanel").select("[id=view3]").select("g").remove();
	var guideline = d3.select("#supportPanel").select("[id=view3]")
			.append("g")
			.append("div")
			.style("width","900px")
			.style("margin","auto")
			
	guideline.append("div")
			.style("width","100%")
			.style("font-size","21px")
			.text("To run data mining, select target solutions on the scatter plot. Then click the button below.");

	guideline.append("div")
			.style("width","300px")
			.style("margin","auto")
			.append("button")
			.attr("id","getDrivingFeaturesButton")
			.style("margin-top","30px")
			.style("width","200px")
			.style("font-size","19px")
			.text("Run data mining");
	d3.selectAll("[id=getDrivingFeaturesButton]").on("click", runDataMining);
    
    
}

function initialize_tabs_classification_tree(){

	if(testType=="3"){
		d3.select("#supportPanel").select("[id=view4]").select("g").remove();
		var guideline = d3.select("#supportPanel").select("[id=view4]")
				.append("g")
				.append("div")
				.style("width","900px")
				.style("margin","auto")
				
		guideline.append("div")
				.style("width","100%")
				.style("font-size","21px")
				.text("To run data mining, select target solutions on the scatter plot. Then click the button below.");

		guideline.append("div")
				.style("width","300px")
				.style("margin","auto")
				.append("button")
				.attr("id","getDrivingFeaturesButton")
				.style("margin-top","30px")
				.style("width","200px")
				.style("font-size","19px")
				.text("Run data mining");
		d3.selectAll("[id=getDrivingFeaturesButton]").on("click", runDataMining);
	}else{
		return;
	}
}



function set_selection_option(selected_option){
	if(testType=="1"){
		return;
	}
	if(selected_option=="1"){
		d3.select("#zoom-pan")[0][0].checked=true;
		d3.select("#drag-select")[0][0].checked=false;
		d3.select("#de-select")[0][0].checked=false;
	}else if(selected_option=="2"){
		d3.select("#zoom-pan")[0][0].checked=false;
		d3.select("#drag-select")[0][0].checked=true;
		d3.select("#de-select")[0][0].checked=false;
	}else{
		d3.select("#zoom-pan")[0][0].checked=false;
		d3.select("#drag-select")[0][0].checked=false;
		d3.select("#de-select")[0][0].checked=true;
	}
	scatterPlot_selection_option(selected_option)
}


function round_num_2_perc(num){
	var temp = num*100;
	return temp.toFixed(1);
}

function round_num_fourth_dec(num){
	return num.toFixed(4);
}



function get_selected_arch_ids(){
	var target_string = "";
	d3.selectAll('.dot.archPlot.selected')[0].forEach(function(d){
		target_string = target_string + "," + d.__data__.id;
	});
	return target_string.substring(1,target_string.length);
}

function get_selected_arch_ids_list(){
	var target = [];
	d3.selectAll('.dot.archPlot.selected')[0].forEach(function(d){
		target.push(d.__data__.id);
	});
	return target;
}


function select_archs_using_ids(target_ids_string){
	//var target_ids_string = "356,1695,1696,1701,1702,1703,1704,1719,1720,1722,1723,1724,1725,1726,1727,1728,1729,1733,1734,1735,1737,1741,1743,1744,1745,1753,1760,1761,1762,1763,1764,1765,1767,1771,1775,1776,1777,1784,1785,1786,1787,1788,1790,1796,1797,1801,1802,1803,1804,1805,1813,1814,1817,1818,1819,1820,1821,1822,1823,1824,1825,1827,1828,1830,1831,1832,1835,1843,1849,1850,1855,1856,1862,1864,1865,1871,1875,1876,1878,1879,1880,1888,1889,1890,1891,1894,1896,1902,1907,1908,1909,1910,1920,1922,1924,1926,1928,1930,1932,1933,1934,1936,1937,1939,1941,1947,1952,1953,2004,2008,2014,2026,2028,2034,2035,2039,2041,2046,2047,2051,2053,2059,2069,2122,2128,2131,2158,2164,2165,2178,2182,2183,2186,2188,2190,2192,2195,2196,2198,2200,2203,2204,2208,2210,2212,2237,2241,2243,2247,2250,2256,2257,2258,2265,2266,2267,2268,2269,2271,2272,2274,2283,2293,2295,2297,2302,2303,2305,2307,2308,2310,2314,2322,2327,2332,2343,2355,2358,2359,2360,2361,2362,2363,2364,2365,2369,2374,2378,2379,2380,2382,2383,2384,2385,2400,2402,2403,2405,2409,2411,2413,2416,2417,2421,2426,2452,2453,2455,2456,2457,2459,2460,2477,2497,2499,2501,2503,2519,2522,2523,2528,2536,2539,2541,2543,2567,2569,2575,2583,2586,2587,2598,2604,2605,2613,2614,2617,2618";
	var target_ids_split = target_ids_string.split(',');
	var target_ids =[];
	for(var i=0;i<target_ids_split.length;i++){
		var id = + target_ids_split[i];
		target_ids.push(id);
	}
    d3.selectAll('.dot.archPlot')[0].forEach(function(d){
    	if(target_ids.indexOf(d.__data__.id)!=-1){
    		d3.select(d)
    			.classed('selected',true)
    			.style("fill", selectedColor);
    	}
    });

}



////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//Experiment

var high_cost_high_perf = "1701,1702,1703,1729,1736,1738,1739,1740,1741,1742,1744,1745,1746,1761,1787,1788,1789,1790,1792,1795,1797,1798,1802,1803,1804,1805,1821,1828,1830,1833,1841,1851,1855,1857,1861,1873,1876,1877,1882,1883,1886,1888,1893,1901,1906,1912,1914,1926,1928,1931,1944,1949,1981,1989,1991,1992,1998,2002,2012,2013,2015,2022,2024,2044,2045,2057,2074,2082,2084,2122,2177,2179,2184,2186,2187,2188,2189,2195,2200,2235,2237,2239,2241,2249,2251,2255,2260,2262,2274,2276,2280,2281,2282,2287,2288,2293,2296,2308,2312,2336,2344,2353,2356,2358,2359,2360,2361,2372,2376,2409,2464,2467,2472,2474,2479,2480,2481,2482,2485,2487,2491,2495,2505,2510,2534,2542,2567,2572,2584,2605,2608,2609,2615";
var mid_cost_mid_perf = "1693,1717,1718,1720,1721,1722,1723,1724,1725,1726,1727,1731,1732,1733,1735,1758,1759,1760,1761,1762,1765,1773,1774,1782,1783,1784,1786,1795,1812,1815,1817,1818,1819,1820,1823,1830,1841,1847,1848,1853,1854,1862,1863,1869,1873,1874,1877,1886,1887,1888,1889,1892,1894,1906,1907,1918,1920,1924,1926,1932,1934,1935,1937,1939,1945,2002,2006,2024,2026,2032,2044,2049,2051,2067,2120,2156,2163,2180,2184,2186,2190,2193,2202,2206,2208,2210,2241,2245,2248,2256,2263,2266,2267,2270,2272,2291,2293,2300,2301,2303,2306,2308,2312,2320,2330,2353,2356,2358,2360,2362,2376,2377,2378,2380,2383,2400,2401,2403,2409,2411,2414,2415,2419,2450,2451,2454,2455,2458,2501,2517,2520,2521,2534,2537,2539,2541,2573,2602,2612,2615";
var low_cost_low_perf = "19,25,26,34,44,77,81,106,108,168,1690,1692,1693,1695,1696,1697,1698,1706,1707,1710,1713,1718,1719,1721,1731,1732,1733,1752,1757,1763,1765,1770,1771,1773,1774,1776,1777,1779,1781,1806,1808,1809,1810,1813,1815,1817,1835,1836,1837,1838,1844,1848,1849,1850,1852,1853,1854,1856,1858,1866,1867,1868,1869,1905,1907,1910,1913,1916,1917,1918,1925,1932,1933,1934,1935,1941,1943,1945,1954,1956,1960,1961,1965,2027,2033,2047,2049,2052,2062,2086,2088,2105,2107,2115,2123,2136,2143,2146,2153,2156,2157,2163,2165,2174,2202,2205,2206,2213,2217,2222,2225,2248,2263,2271,2272,2306,2319,2325,2334,2346,2354,2380,2389,2391,2400,2417,2419,2425,2426,2433,2436,2437,2444,2448,2450,2488,2494,2496,2513,2520,2521,2527,2531,2532,2541,2544,2545,2549,2552,2553,2554,2559,2576,2579,2596,2602";
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////



function turn_highlighted_to_selection(){
	
    d3.selectAll('.dot.archPlot.selected')
		.classed('selected',false)
        .classed('highlighted',false)
	    .style("fill", defaultColor); 
    
	d3.selectAll('.dot.archPlot.highlighted')
        .classed('selected',true)
		.classed('highlighted',false)
		.style("fill", selectedColor);  
}




