var express = require('express');
var app = express();
var qs = require('querystring');
var path = require('path');
var fs = require('fs');


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

        <h2><p><b>My temperature</b></p></h2>
        <p>
        <h4>thingspeak graph<h4>
        <iframe width="450" height="260" style="border: 1px solid #cccccc;" src="https://thingspeak.com/channels/725655/charts/1?bgcolor=%23ffffff&color=%23d62020&dynamic=true&results=60&type=line"></iframe>
        </p>
        <h4>sever data
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

    </style>`;

  },
  'Script':function() {
    return `<script src="/socket.io/socket.io.js"></script>
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js"></script>
    <script>
      var socket = io.connect("ec2-18-223-155-255.us-east-2.compute.amazonaws.com");
      socket.on('temp',function(data) {
	        $('#myTable').html(data);
      });
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

  }
}
