var express = require('express');
var app = express();
var qs = require('querystring');
var path = require('path');
var fs = require('fs');
var dateFormat = require('dateformat');


module.exports= {

  'HTML':function(style,script,td) {
    return `<!DOCTYPE html>
    <html>
    ${style}
    <head>
     <title>My temperature</title>
    ${script}
    </head>
    <body>
        <h2><p><b>My temperature-강태호</b></p></h2>
        <p>
        <a href="https://github.com/EBEL21/Capstone-Design/blob/master/web-server/web.js">Nodejs code link</a><br>
        <a href="https://github.com/EBEL21/Capstone-Design/blob/master/Arduino/temperature/temperature.ino">Arduino code link</a>
        </p>
        <h4>[Google Chart]</h4>
        <div id="timeCont">
          <b>Start time:<b><%START%></br>
          <b>End time:<b><%END%></br>
        </div>
        </br>
        <div id="myChart"></div>
        <h4>Sever data(last 1 hour)
        <div id="myDiv">
            <table>
                <thead>
                    <tr>
		  	                <th>#</th>
                        <th>Time</th>
                        <th>Temperature</th>
                        <th>diff</th>
                    </tr>
                </thead>
                <tbody id="myTable">
                  ${td}
                </tbody>
            </table>


        </div>
    </body>
    </html>`;
  },
  'Style':function() {

    return `<style>
        #myDiv {
            margin-top:5px;
        }
        table {
            width:700px;
            font:13px bold;
            border-collapse:collapse;
        }
        thead {

          background-color: LightGray;
        }

        td, th {
            border:2px solid grey;
            text-align:center;
            padding:3px;
        }

        a {
          font-size: 20px;
        }

        #timeCont {
          width:300px;
          padding:3px;
          margin-bottom:5px;
          background-color: rgb(255, 130, 78);
        }


    </style>`;

  },
  'Script':function() {
    return `<script src="/socket.io/socket.io.js"></script>
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js"></script>
    <script type="text/javascript" src="https://www.gstatic.com/charts/loader.js"></script>
    <script>
    google.charts.load('current', {packages:['corechart']});
    google.charts.setOnLoadCallback(drawChart);

      var socket = io.connect("ec2-18-223-155-255.us-east-2.compute.amazonaws.com");
      socket.on('temp',function(data) {
	        $('#myTable').html(data.td);
      });

      function drawChart(jsonData) {
      var data = new google.visualization.DataTable();
      data.addColumn('datetime','Date/Time');
      data.addColumn('number','degree');
      data.addRows(
        <%DATA%>
      );
      var options = {
        title: 'My Room Temperature',
        subtitle: 'Made by 강태호',
	      chartArea: {width:'90%', height:'80%', left:'20px', top:'10px'},
	      legend: 'none',
        hAxis: {title:'date'},
        vAxis: {title:'degree'},
        backgroundColor: {stroke: '#ff99bb', strokeWidth:5},
        width: 1200,
        height: 600
      };
      var chart = new google.visualization.LineChart(document.getElementById('myChart'));
      chart.draw(data, options);
      }
    </script>`;
  },
  'ReadFile':function() {
    var data;
      fs.readFile('data2','utf8',function(err,content) {
        if(err) {
            console.log('readFile error');
        } else{
          data = JSON.parse(content);
          console.log(data.datas);
          return data;
        }
      });
  },
  'WriteFile':function(data) {
    var ary = JSON.stringify(data)
    fs.writeFile('data2',ary,'utf8',function(err) {
      if(err) {
          console.log('writeFile error');
      }
    });
  },
  'MakeTag':function() {
    var dataAry = JSON.parse(fs.readFileSync('data2','utf8'));
    var i;
    var tag ='';
    for(i in dataAry) {
      tag += `<tr>
		<td>${i}</td>
                <td>${dataAry[i].date}</td>
                <td>${dataAry[i].data}˚C</td>`;
      if(dataAry[i].diff > 0) {
        tag += `<td style='color:red'>+${dataAry[i].diff}</td>`;
      } else if(dataAry[i].diff < 0) {
        tag += `<td style='color:blue'>${dataAry[i].diff}</td>`
      } else {
        tag += `<td>${dataAry[i].diff}</td>`;
      }
      tag += `</tr>`;
    }
    return tag;
  },
  'MakeData':function(datas) {
      var ary = "[";
    	var comma = "";
    	for(i in datas) {
        var date = dateFormat(datas[i].time,"yyyy/mm/dd/HH/MM/ss");
        date = date.split("/");
	date[1] -= 1;
        ary+=`${comma}[new Date(${date}),${datas[i].degree}]`;
        comma =",";
      }
      ary +="]";
      return [ary,datas[0].time,datas[datas.length-1].time];
    }
}
