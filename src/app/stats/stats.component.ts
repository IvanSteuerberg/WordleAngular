import { HttpClient } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import DatalabelsPlugin from 'chartjs-plugin-datalabels';

@Component({
  selector: 'app-stats',
  templateUrl: './stats.component.html',
  styleUrls: ['./stats.component.scss']
})
export class StatsComponent implements OnInit {
  public games!: number;
  public wins!: number;
  public winRate!: number;
  public loses!: number;
  public ranking!: number;
  public totalRanking!: number;
  public pieChartOptions: ChartConfiguration['options'];
  public pieChartData: ChartData<'pie', number[], string | string[]> | undefined;
  public pieChartType: ChartType = 'pie';
  public pieChartPlugins = [ DatalabelsPlugin ];


  constructor(@Inject (MAT_DIALOG_DATA) public data:any, private http : HttpClient) { }
  async ngOnInit() {
    await this.getData();
    this.pieChartOptions = {
      responsive: true,
      plugins: {
        legend: {
          display: true,
          position: 'top',
        },
        datalabels: {
          formatter: (value, ctx) => {
            if (ctx.chart.data.labels) {
              return ctx.chart.data.labels[ctx.dataIndex];
            }
          },
        },
      }
    };

    this.pieChartData = {
      labels: [ 'Victorias', 'Derrotas',],
      datasets: [ {
        data: [ this.wins, this.loses ],
        backgroundColor: [
          'rgb(154, 200, 255)',
          'rgb(255, 125, 150)'
        ],
        hoverBackgroundColor:[
          'rgb(125, 175, 255)',
          'rgb(255, 100, 125)'
        ],
        hoverBorderColor:[
          'rgb(125, 175, 255)',
          'rgb(255, 100, 125)'
        ]
      } ]
    };
    

  }

  async getData(){
    var jwt = localStorage.getItem("jwt");
    if (jwt == null){
      jwt = ''
    }
    const response = await fetch("https://localhost:5001/api/stats/"+this.data.username, {method:'GET', headers: new Headers({Authorization: 'Bearer '+jwt})});
    var responseJson = await response.json();
    this.games = responseJson.games;
      this.wins = responseJson.wins;
      this.winRate = responseJson.winRate;
      this.loses = this.games - this.wins;
      this.ranking = responseJson.ranking;
      this.totalRanking = responseJson.total;
  }


}
