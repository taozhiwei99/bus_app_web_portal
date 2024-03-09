import React, {useState, useEffect} from 'react'
import {
  Card,
  CardBody,
  Typography,
  CardHeader,
  Button,
} from '@material-tailwind/react'
import axios from 'axios';
import { ArrowLongRightIcon } from "@heroicons/react/24/outline";
import '../css/defaultstyle.css'
import DefaultSchoolLogo from '../assets/images/schoollogo.jpg'
import { useNavigate } from 'react-router';

export default function DashboardVendor() {
  // VIEW FUNCTION START //
  const [schoolData, setSchoolData] = useState([]);

  useEffect(() => {
    // Get the stored array of school IDs from localStorage
    const storedSchoolIdsString = localStorage.getItem('assoc_schools');
    const storedSchoolIds = JSON.parse(storedSchoolIdsString);

    // Fetch school data from the API
    const fetchData = async () => {
      try {
        const response = await axios.get(`https://lagj9paot7.execute-api.ap-southeast-1.amazonaws.com/dev/api/ven-getschooldetails/${storedSchoolIds}`);
        setSchoolData(response.data);
      } catch (err) {
        console.error(err);
      }
    };

    if (storedSchoolIds && storedSchoolIds.length > 0) {
      fetchData();
    } else {
      // If there are no school IDs, set an empty array for schoolData
      setSchoolData([]);
    }
  }, []);

  const navigate = useNavigate();
  const handleViewVehiclePickUpJobs = (school_ID) => {
    navigate(`/vendor/dashboard/viewvehiclepickupjobs?school_ID=${school_ID}`)
  }
  // VIEW FUNCTION END //
  
  return (
    <>
      <div>
        <p style={{color: '#56844B', fontWeight: 'bold', fontSize: '20px'}}>
          Welcome, VENDOR {localStorage.getItem('vendorname')}
        </p> 
        <Typography style={{marginTop: '30px', fontSize: '18px'}}>
          You are currently partnered with school(s):
        </Typography>
      </div>

      {/* School information card */}
      {schoolData.length == 0 ? (
        <Card className="flex-row w-full max-w-[48rem]" style={{ marginTop: '15px' }}>
          <CardBody>
          <Typography variant="h4" color="blue-gray" className="mb-2">
            No schools partnered yet
          </Typography>
          </CardBody>
        </Card>
      ) : (
        schoolData.map((s) => (
          <Card key={s.school_ID} className="flex-row w-full max-w-[48rem]" style={{ marginTop: '15px' }}>
            <CardHeader shadow={false} floated={false} className="w-2/5 shrink-0 m-0 rounded-r-none">
              <img src={s.imageURI ? s.imageURI : DefaultSchoolLogo} alt="image" style={{ marginLeft: '10%' }} />
            </CardHeader>
            <CardBody style={{ marginTop: '25px' }}>
              <Typography variant="h4" color="blue-gray" className="mb-2">
                {s.school_Name}
              </Typography>
              <Typography color="gray" className="font-normal">
                Address: {s.address}
              </Typography>
              <Typography color="gray" className="font-normal mb-4">
                Contact: {s.contactNo}
              </Typography>
              <a className="inline-block" onClick={() => handleViewVehiclePickUpJobs(s.school_ID)}>
                <Button variant="text" className="flex gap-2" style={{ paddingLeft: '0px' }}>
                View expected job volumes <ArrowLongRightIcon strokeWidth={2} className="w-4 h-4" />
                </Button>
              </a>
           </CardBody>
          </Card>
        ))
      )}
    </>
  )
}
