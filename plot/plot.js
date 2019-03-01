webtk = window.webtk || {};

webtk.plot_style = function webtk_plot_style(){
  if(webtk_plot_style.ready) return;
  webtk_plot_style.ready = true;
  var style = document.createElement("style");
  document.head.appendChild(style);
  style.innerText = `

span.pull-left {
  position:absolute;
  left:0;
}

div.histogram {
    position:relative;
    vertical-align:top;
    display: inline-block;
    text-align: center;
    border:1px solid #eee;
    margin:0 0;
    padding: 0 8px;
    user-select:none;
    padding-bottom: 36px;
    box-sizing: border-box;
    min-height:120px;
    height: 100%;
    padding-bottom: 32px;
}

ul.histogram {
    /*
     position: absolute;
    top: 32px;
    left: 0;
    bottom: 0px;
    */
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    padding-bottom: 16px;
    padding-left: 8px;
    margin: 0;
    text-align: left;
}

.histogram-mode-1 li {
    background-color: #00c0c0 !important;
}

.histogram-mode-2 li {
    background-color: #00c0c0 !important;
}

div.histogram > h6 {
  font-size: 12px;
  margin: 3px 0 14px 0;
  padding: 0 3em;
}
div.histogram > .maxline {
    border-bottom: 1px solid #cef;
    text-align: right;
    font-size: 11px;
    color: #6cf;
    font-weight: bold;
    /* z-index: 999; */
    margin-top: -12px;
    line-height: 1;
    position:relative;
}
ul.histogram > li {
    display:inline-block;
    width:6px;
    background-color:#cef;
    margin:0 3px;
    position:relative;

}
ul.histogram.compact > li {
    width: 6px;
    margin:0 2px;
}
ul.histogram > li.nodata {
    width: 100% !important;
    height:100%;
    background-color: #f9f9f9;
}
ul.histogram > li.nodata > label {
    top:40%;
}
.histogram.wide li {
    width: 42px;  /* TODO: calc this width */
    margin:0 2px;
}
.histogram.compact li {
    width: 8px;  /* TODO: calc this width */
    margin:0 2px;
}
.histogram.compact li:nth-child(even) label {
  display:none;
}
ul.histogram > li.alert {
    background-color: #fcc;
}


ul.histogram > li > label {
    position:absolute;
    bottom:-18px;
    left:0;
    right:0;
    text-align:center;
    font-size:11px;
  }
  `;
};

webtk.plot_xy = function(that, data, meta){
    this.plot_style();

    var title  = meta?meta.title:"WebTk Plot";
    var y_max  = 0;
    var y_max_label = 0;
    var plot_class  = "";

    var data_x = data.x;
    var data_y = data.y;


    var points = [];
    var y_max = Number.NEGATIVE_INFINITY;
    for(var i=0, n=data_x.length; i<n; i++){
      points.push([i, data_x[i], data_y[i]]);
      y_max = Math.max(y_max, data_y[i]);
    }

    if(meta && meta.sort == 'x') {
      points.sort(function(a, b){return a[1]-b[1]});
    }

    // TODO: sort

    var ul = document.createElement("ul");
    for(var i=0, n=points.length; i<n; i++){
      var pt = points[i];
      var x = pt[1];
      var y = pt[2];

      var y_norm = y*100.0/y_max;
      var x_norm = x;
      var label  = x;

      var li = document.createElement("li");
      li.setAttribute("style", "height:" + y_norm + '%');
      li.setAttribute('data-value', y);
      li.setAttribute('title', [x, y].join('='));

      var li_label = document.createElement("label");
      li_label.innerText = label;
      li.appendChild(li_label);
      ul.appendChild(li);
    }

    var html = `
    <div class='histogram ${plot_class}' onclick='webtk.plot_replot(this)'>
      <h6>${title}</h6>
      <div class='maxline'><span class='pull-left'>${y_max_label}</span><span class='pull-right'>${y_max}</span></div>
      <ul class='histogram'>${ul.innerHTML}</ul>
    </div>
    `;

    // that.dataset["webtk_plot_data"] = points;
    // Object.defineProperty(that, "webtk_plot_data", {value: points});
    that.innerHTML = html;
    that.firstElementChild.webtk_plot_data = points;
    that.firstElementChild.webtk_plot_mode = "normal";
};

webtk.plot_replot = function(that){
  var points = that.webtk_plot_data;
  var mode   = that.webtk_plot_mode;

  var y_max = Number.NEGATIVE_INFINITY;

  var points = points.slice(0);
  var mode_list = ["normal", "sum", "sum-reverse"];
  var next_mode = mode_list[(mode_list.indexOf(mode)+1)%mode_list.length];
  that.webtk_plot_mode = next_mode;
  if(next_mode=="normal"){
      // no change
    for(var i=0, sum=0, n=points.length; i<n; i++){
      var pt = points[i].slice(0);  // make a copy
      var x = pt[1];
      var y = pt[2];
      y_max = Math.max(y_max,y);
      points[i] = pt;
    }
  }else if(next_mode=="sum"){
    for(var i=0, sum=0, n=points.length; i<n; i++){
      var pt = points[i].slice(0);  // make a copy
      var x = pt[1];
      var y = pt[2];
      sum += y;
      pt[2] = sum;
      y_max = sum;
      points[i] = pt;
    }
  }else if(next_mode=="sum-reverse"){
    for(var i=points.length-1, sum=0; i>=0; i--){
      var pt = points[i].slice(0);  // make a copy
      var x = pt[1];
      var y = pt[2];
      sum += y;
      pt[2] = sum;
      y_max = sum;
      points[i] = pt;
    }
  }

    var ul = document.createElement("ul");
    for(var i=0, n=points.length; i<n; i++){
      var pt = points[i];
      var x = pt[1];
      var y = pt[2];

      var y_norm = y*100.0/y_max;
      var x_norm = x;
      var label  = x;

      var li = document.createElement("li");
      li.setAttribute("style", "height:" + y_norm + '%');
      li.setAttribute('data-value', y);
      li.setAttribute('title', [x, y].join('='));

      var li_label = document.createElement("label");
      li_label.innerText = label;
      li.appendChild(li_label);
      ul.appendChild(li);
    }

    that.getElementsByTagName("ul")[0].innerHTML = ul.innerHTML;
};

