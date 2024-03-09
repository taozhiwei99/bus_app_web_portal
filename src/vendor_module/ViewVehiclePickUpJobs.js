import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import { 
  Card, 
  CardBody,
  Typography, 
} from "@material-tailwind/react";
import '../css/defaultstyle.css';

export default function ViewVehiclePickUpJobs() {
  // VIEW FUNCTION START //
  // Get the school_ID which the vendor click in the DashboardVendor page
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const school_ID = searchParams.get('school_ID');

  // Get todays' date
  // +8 hours for singapore timezone GMT+8
  const datetime = new Date();
  datetime.setHours(datetime.getHours() + 8);
  const singaporeDatetime = datetime.toISOString().split('T')[0];
  const forFrontendDisplayDT = datetime.toLocaleDateString('en-US', {year: 'numeric', month: 'long', day: 'numeric'});

  // The 2 fixed pickup timing for vehicle pickup
  // Timeslot 1 and 2
  const TS1 = '2:30pm';
  const TS2 = '5:30pm';

  // Declare array for pick up jobs, in each region, for each pickup timeslot, 
  // Default of 0 jobs 
  const pickUpJobsDefaultTS1 = [
    {'Region': 'North', 'Capacity': 0},
    {'Region': 'West', 'Capacity': 0}, 
    {'Region': 'East', 'Capacity': 0},
    {'Region': 'South', 'Capacity': 0},
    {'Region': 'Central', 'Capacity': 0},
  ]

  const pickUpJobsDefaultTS2 = [
    {'Region': 'North', 'Capacity': 0},
    {'Region': 'West', 'Capacity': 0}, 
    {'Region': 'East', 'Capacity': 0},
    {'Region': 'South', 'Capacity': 0},
    {'Region': 'Central', 'Capacity': 0},
  ]

  // Retrieve school details
  const [schoolData, setSchoolData] = useState([])
  useEffect(()=> {
    axios.get(`https://lagj9paot7.execute-api.ap-southeast-1.amazonaws.com/dev/api/ven-getschooldetails/${school_ID}`)
    .then(res=>{
      setSchoolData(res.data)
    })
  }, [school_ID])

  // Retrieve data from vehiclepickup_jobs table in DB
  const [retrievePickUpJobsTS1, setRetrievePickUpJobsTS1] = useState([])
  const [retrievePickUpJobsTS2, setRetrievePickUpJobsTS2] = useState([])

  useEffect(()=>{
    Promise.all([
      axios.post('https://lagj9paot7.execute-api.ap-southeast-1.amazonaws.com/dev/api/ven-getvehiclepickupjobstimeslot1', {
        si: school_ID,
        d: singaporeDatetime,
        ts1: TS1,
      }),
      axios.post('https://lagj9paot7.execute-api.ap-southeast-1.amazonaws.com/dev/api/ven-getvehiclepickupjobstimeslot2', {
        si: school_ID,
        d: singaporeDatetime,
        ts2: TS2,
      })
    ])
      .then(([ts1Res, ts2Res]) => {
        setRetrievePickUpJobsTS1(ts1Res.data.r1)
        setRetrievePickUpJobsTS2(ts2Res.data.r2)
      })
      .catch(err => {
        console.error(err);
      });
  }, [school_ID])

  // Map the data received from vehiclepickup_jobs table
  // Meaning if there was data retrieved from DB, it will replace the default value of 0 jobs, otherwise, jobs for the region will still be 0
  const [pickUpJobsTodayTS1, setPickUpJobsTodayTS1] = useState([])
  const [pickUpJobsTodayTS2, setPickUpJobsTodayTS2] = useState([])

  // Mapping for timeslot 1
  useEffect(() => {
    const matchPickUpJobsTodayTS1 = pickUpJobsDefaultTS1.map(defaultItem => {
      const matchRetrievePickUpJob = retrievePickUpJobsTS1.find(job => job.dropoff_Region === defaultItem.Region)

      if (matchRetrievePickUpJob) {
        return {
          Region: defaultItem.Region,
          Capacity: matchRetrievePickUpJob.capacity
        }
      } else {
        return defaultItem;
      }
    })
    setPickUpJobsTodayTS1(matchPickUpJobsTodayTS1);
  }, [retrievePickUpJobsTS1])

  // Mapping for timeslot 2
  useEffect(() => {
    const matchPickUpJobsTodayTS2 = pickUpJobsDefaultTS2.map(defaultItem => {
      const matchRetrievePickUpJob = retrievePickUpJobsTS2.find(job => job.dropoff_Region === defaultItem.Region)

      if (matchRetrievePickUpJob) {
        return {
          Region: defaultItem.Region,
          Capacity: matchRetrievePickUpJob.capacity
        }
      } else {
        return defaultItem;
      }
    })
    setPickUpJobsTodayTS2(matchPickUpJobsTodayTS2);
  }, [retrievePickUpJobsTS2])
  // VIEW FUNCTION END //

  const calculateCapacitySum = (array) => {
    return array.reduce((sum, item) => sum + item.Capacity, 0);
  };

  return (
    <>
      <div className="mt-3 mb-4">
        {schoolData.map((i, idx) => (
        <>
          <div className="p-4 justify-center">
            <p className="font-bold text-lg" style={{ fontSize: '20px', color: '#56844B' }}>
              Viewing {i.school_Name}'s expected job volume for Today {forFrontendDisplayDT}
            </p>
          </div>
        </>
        ))}

        <div className="flex items-center">
          <Card className="mt-6 mr-10 w-96">
            <CardBody>
              <Typography variant="h5" color="blue-gray" className="mb-2">
                Timeslot 1 : {TS1}
              </Typography>
              {pickUpJobsTodayTS1.slice(0, 5).map((item, index) => (
                <Typography key={index} variant="lead" className="p-2 text-right">
                  {item.Region} Region - Confirmed Jobs: <b>{item.Capacity}</b>
                </Typography>
              ))}
              <Typography variant="lead" className="p-2 text-right">
                Total: <b>{calculateCapacitySum(pickUpJobsTodayTS1)}</b>
              </Typography>
            </CardBody>
          </Card>

          <Card className="mt-6 w-96">
            <CardBody>
              <Typography variant="h5" color="blue-gray" className="mb-2">
                Timeslot 2 : {TS2}
              </Typography>
              {pickUpJobsTodayTS2.slice(0, 5).map((item, index) => (
                <Typography key={index} variant="lead" className="p-2 text-right">
                  {item.Region} Region - Confirmed Jobs: <b>{item.Capacity}</b>
                </Typography>
              ))}
              <Typography variant="lead" className="p-2 text-right">
              Total: <b>{calculateCapacitySum(pickUpJobsTodayTS2)}</b>
              </Typography>
            </CardBody>
          </Card>
        </div>
      </div>
    </>
  )
}