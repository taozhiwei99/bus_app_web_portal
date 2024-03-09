import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Chart from 'chart.js/auto';

export default function DashboardSystemAdmin() {
  const firstname = localStorage.getItem('firstname').toUpperCase();
  const lastname = localStorage.getItem('lastname').toUpperCase();

  const [subscriberChartData, setSubscriberChartData] = useState([]);
  const [subscriberChartDataSorted, setSubscriberChartDataSorted] = useState([]);

  useEffect(() => {
    axios
      .get('https://lagj9paot7.execute-api.ap-southeast-1.amazonaws.com/dev/api/sysadm-getsubscribercountbyschool')
      .then(getRes => {
        if (getRes.data) {
          setSubscriberChartData(getRes.data);
        }
      })
      .catch(err => {
        console.error(err);
      });
  }, []);

  useEffect(() => {
    if (subscriberChartData.length > 0) {
      const dataSize = 1;
      const tempSortedData = [];
      for (let i = 0; i < subscriberChartData.length; i += dataSize) {
        tempSortedData.push(subscriberChartData.slice(i, i + dataSize));
      }
      setSubscriberChartDataSorted(tempSortedData);
    }
  }, [subscriberChartData]);

  useEffect(() => {
    if (subscriberChartDataSorted.length > 0) {
      subscriberChartDataSorted.forEach((chunk, index) => {
        const ctx = document.getElementById(`subscriberChart${index}`).getContext('2d');

        const labels = chunk.map(item => item.school_ID);
        const normalCounts = chunk.map(item => item.normal_count);
        const premiumCounts = chunk.map(item => item.premium_count);

        const data = {
          labels: labels,
          datasets: [
            {
              label: 'Normal users',
              backgroundColor: 'rgba(86, 132, 75, 0.9)',
              borderColor: 'rgba(86, 132, 75)',
              borderWidth: 1,
              data: normalCounts,
            },

            {
              label: 'Gap',
              backgroundColor: 'rgba(0, 0, 0, 0)',
              borderColor: 'rgba(0, 0, 0, 0)',
              borderWidth: 0,
              data: Array(labels.length).fill(0),
              barPercentage: 0.05,
            },

            {
              label: 'Premium users',
              backgroundColor: 'rgba(132, 75, 95, 0.9)',
              borderColor: 'rgba(132, 75, 95)',
              borderWidth: 1,
              data: premiumCounts,
            },
          ],
        };

        new Chart(ctx, {
          type: 'bar',
          data: data,
          options: {
            indexAxis: 'y',
            responsive: true,
            plugins: {
              legend: {
                position: 'top',
              },
            },

          },
        });
      });
    }
  }, [subscriberChartDataSorted]);

  return (
    <>
      <div>
        <p style={{ fontSize: '20px', color: '#56844B', fontWeight: 'bold' }}>
          Welcome, SYSTEM ADMIN {firstname} {lastname}
        </p>
      </div>

      <div className="my-5">
        <p 
          className="font-bold mr-auto text-lg"
          style={{ fontSize: '20px', color: '#56844B'}} >
          Number of Normal and Premium users, per School
        </p>        
      </div>

      {subscriberChartDataSorted.length > 0 &&
        subscriberChartDataSorted.map((chunk, index) => (
          <div key={index} className='pb-20'>
            <canvas id={`subscriberChart${index}`} height="100" width="700"></canvas>
          </div>
        ))
      }
    </>
  );
}
