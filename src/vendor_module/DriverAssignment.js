import { React, useState, useEffect } from 'react'
import axios from 'axios'
import {
  Card,
  CardBody,
  Typography,
  Button,
} from '@material-tailwind/react'
import {
  CButton,
  CModal,
  CForm,
  CModalBody,
  CModalHeader,
  CModalTitle,
  CModalFooter,
  CFormSelect,
} from '@coreui/react'
import '../css/defaultstyle.css'

export default function DriverAssignment() {
  // VIEW ASSIGNMENT START //
  const [driverTable, setDriverTable] = useState([]);
  const [vehicleTable, setVehicleTable] = useState([]);
  const [vehicleAssignments, setVehicleAssignments] = useState([]);
  const [combinedData, setCombinedData] = useState([]);

  const TABLE_HEAD = ["DRIVER ID", "NAME", "VEHICLE PLATE","VEHICLE TYPE", "CAPACITY", "DATE ASSIGNED", ""];

  const vendorid = localStorage.getItem('userid');

  // Get all vehicles and drivers associated with the vendor
  useEffect(() => {
    Promise.all([
      axios.get(`https://lagj9paot7.execute-api.ap-southeast-1.amazonaws.com/dev/api/ven-getvehicles/${vendorid}`),
      axios.get(`https://lagj9paot7.execute-api.ap-southeast-1.amazonaws.com/dev/api/ven-getdrivers/${vendorid}`)
    ])
      .then(([vehicleRes, driverRes]) => {
        setVehicleTable(vehicleRes.data);
        setDriverTable(driverRes.data);
      })
      .catch(err => {
        console.error(err);
      });
  }, []);

  // Get all vehicle assignments associated with the driver IDs
  useEffect(() => {
    axios.get(`https://lagj9paot7.execute-api.ap-southeast-1.amazonaws.com/dev/api/ven-getvehicleassignments/${vendorid}`)
      .then((response) => {
        setVehicleAssignments(response.data);
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);

  // Combine the data from driverTable, vehicleTable, and vehicleAssignments
  useEffect(() => {
    const combinedDataArray = [];
    driverTable.forEach((driver) => {
      const { driver_ID, firstName, lastName, email, contactNo } = driver;
      const driverAssignments = vehicleAssignments.filter((assignment) => assignment.driver_ID === driver_ID);
      driverAssignments.forEach((assignment) => {
        const { vehicle_Plate, datetime } = assignment;
        const assignedVehicle = vehicleTable.find((vehicle) => vehicle.vehicle_Plate === vehicle_Plate);
        const { vehicle_Type, capacity } = assignedVehicle || { vehicle_Type: '', capacity: '' };
  
        // Create an object for each row with named properties
        const rowData = {
          driver_ID,
          firstName,
          lastName,
          email,
          contactNo,
          vehicle_Plate,
          vehicle_Type,
          capacity,
          datetime,
        };
        combinedDataArray.push(rowData);
      });
    });
    setCombinedData(combinedDataArray);
    
  }, [driverTable, vehicleTable, vehicleAssignments]);
  // VIEW ASSIGNMENT END //


  // ASSIGN DRIVER TO VEHICLE START //
  const [assignDriverModalVisible, setAssignDriverModalVisble] = useState(false);
  const [selectedDriverId, setSelectedDriverId] = useState('');
  const [selectedVehicleId, setSelectedVehicleId] = useState('');

  const handleVehicleAssignment = async () => {
    // Validation, check if user actually selected a driver and a vehicle
    if (!selectedDriverId.trim() || !selectedVehicleId.trim()) {
      alert("Please select a driver and/or a vehicle first.");
      return;
    }
    // Proceed with creating assignment
    // IMPORTANT, datetime to-be inserted into DB must add 8 hours due to Singapore's timezone GMT +8
    const datetime = new Date();
    datetime.setHours(datetime.getHours() + 8);
    const formattedDatetime = datetime.toISOString();
    // IMPORTANT

    axios.post('https://lagj9paot7.execute-api.ap-southeast-1.amazonaws.com/dev/api/ven-createvehicleassignment', { 
      vehicleid: selectedVehicleId, 
      driverid: selectedDriverId, 
      formattedDatetime: formattedDatetime })
      .then(res => {
        if (res.data.success) {
          alert("Driver successfully assigned to the vehicle.");
          window.location.reload();
        } else {
          alert(res.data.errlog)
        }
      })
      .catch(err => {
        console.error(err);
        alert("An error occurred while assigning the driver to the vehicle. Please try again later.");
      });
  };
  // ASSIGN DRIVER TO VEHICLE END //


  // ASSIGN TO PICKUP JOBS FUNCTION START //
  const [showAssignPickUpJobModal, setShowAssignPickUpJobModal] = useState(false)
  const [selectedDriverIdForPickUpJob, setSelectedDriverIdForPickUpJob] = useState('')
  const [selectedVehiclePlateForPickUpJob, setSelectedVehiclePlateForPickUpJob] = useState('')
  const [selectedVehicleCapacityForPickUpJob, setSelectedVehicleCapacityForPickUpJob] = useState('')
  const [selectedSchoolIdForPickUpJob, setSelectedSchoolIdForPickUpJob] = useState('')
  const [selectedRegionForPickUpJob, setSelectedRegionForPickUpJob] = useState('')
  const [selectedTimeSlotForPickUpJob, setSelectedTimeSlotForPickUpJob] = useState('')
  const schoolIds = JSON.parse(localStorage.getItem('assoc_schools'))
  const [schoolDataForModal, setSchoolDataForModal] = useState([])

  useEffect(()=> {
    axios.get(`https://lagj9paot7.execute-api.ap-southeast-1.amazonaws.com/dev/api/ven-getschooldetails/${schoolIds}`)
    .then(res=>{
      setSchoolDataForModal(res.data)
    })
  }, [])

  const handleViewAssignPickUpModal = (driveridforpickupjob, vehicleplateforpickupjob, vehiclecapacityforpickupjob) => {
    setSelectedDriverIdForPickUpJob(driveridforpickupjob)
    setSelectedVehiclePlateForPickUpJob(vehicleplateforpickupjob)
    setSelectedVehicleCapacityForPickUpJob(vehiclecapacityforpickupjob)
    setShowAssignPickUpJobModal(!showAssignPickUpJobModal)
  }

  const handleResetViewAssignPickUpModal = () => {
    setSelectedSchoolIdForPickUpJob('')
    setSelectedRegionForPickUpJob('')
    setSelectedTimeSlotForPickUpJob('')
  }

  // To get the jobs remaining for particular school in particular region for particular 
  const [jobsRemaining, setJobsRemaining] = useState('')

  // IMPORTANT, datetime to-be inserted into DB must add 8 hours due to Singapore's timezone GMT +8 //
  const datetime = new Date();
  const year = datetime.getFullYear();
  const month = datetime.getMonth()+1;
  const date = datetime.getDate();
  const formattedDatetime = year+"-"+month+"-"+date
  // IMPORTANT //

  useEffect(()=>{
    axios.post('https://lagj9paot7.execute-api.ap-southeast-1.amazonaws.com/dev/api/ven-getvehiclepickupjobsremaining',{
      ssi: selectedSchoolIdForPickUpJob,
      sr: selectedRegionForPickUpJob,
      st: selectedTimeSlotForPickUpJob,
      dt: formattedDatetime,
    })
    .then(res1 => {
      if (res1.data.success){
        if (!res1.data.jobsRemaining) {
          setJobsRemaining(0)
        } else {
          setJobsRemaining(res1.data.jobsRemaining)
        }
      } 
    })
  }, [selectedSchoolIdForPickUpJob, selectedRegionForPickUpJob, selectedTimeSlotForPickUpJob])

  const handlePickUpJobAssignment = async () => {
    // Basic validation, check if school or region not selected
    if (!selectedSchoolIdForPickUpJob || !selectedRegionForPickUpJob || !selectedTimeSlotForPickUpJob) {
      alert('Please select the School, Region or Timeslot first')
    } else if (jobsRemaining === 0) {
      alert('There are no more unassigned jobs remaining for the school, region and timeslot you have selected.')
    } else {
      // IMPORTANT, datetime to-be inserted into DB must add 8 hours due to Singapore's timezone GMT +8
      const datetime = new Date();
      datetime.setHours(datetime.getHours() + 8);
      const formattedDatetime1 = datetime.toISOString();
      const formattedDatetime2 = datetime.toISOString().split('T')[0];
      // IMPORTANT

      try{
        axios.put('https://lagj9paot7.execute-api.ap-southeast-1.amazonaws.com/dev/api/ven-assignvehiclepickupjobs',{
          ssi: selectedSchoolIdForPickUpJob,
          sr: selectedRegionForPickUpJob,
          st: selectedTimeSlotForPickUpJob,
          dt1: formattedDatetime1,
          dt2: formattedDatetime2,
          sdi: selectedDriverIdForPickUpJob,
          svp: selectedVehiclePlateForPickUpJob,
          svc: selectedVehicleCapacityForPickUpJob,
        })
        .then(res1=> {
          if (res1.data.success) {
            alert('Successfully assigned driver to pick up job. View details in dashboard page')
            window.location.reload()
          } else {
            alert(res1.data.message)
          }
        })
      } catch (err) {
        console.error(err)
      }
    }
  }
  // ASSIGN TO PICKUP JOBS FUNCTION END //


  // Function to check if given date = todays date, used in filtering table
  const isToday = (date) => {
    
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0'); // Pad with zero if necessary
    const day = String(today.getDate()).padStart(2, '0'); // Pad with zero if necessary
    const todayDate = `${year}-${month}-${day}`;
    const givenDate = new Date(date);
    const formattedGivenDate = givenDate.toISOString().substring(0, 10);;
    
    return (
      formattedGivenDate === todayDate
    );
  };

  // Function to format the date to something like "30 July 2023"
  const [todaysDate, setTodaysDate] = useState('');
  useEffect(() => {
    const formatDate = (date) => {
      const options = { day: 'numeric', month: 'long', year: 'numeric' };
      return new Intl.DateTimeFormat('en-US', options).format(date);
    };

    const today = new Date();
    const formattedDate = formatDate(today);

    setTodaysDate(formattedDate);
  }, []);

  // Function to calculate the difference between jobsRemaining and selectedVehicleCapacityForPickUpJob
  const calculateRemainingCapacity = () => {
    if (jobsRemaining !== '' && selectedVehicleCapacityForPickUpJob !== '') {
      const remainingCapacity = parseInt(jobsRemaining) - parseInt(selectedVehicleCapacityForPickUpJob);
      if (remainingCapacity < 0) {
        return "Assignment sufficient";
      } else {
        return remainingCapacity
      }
    }
  };

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <p 
          className="font-bold mr-auto text-lg"
          style={{ fontSize: '20px', color: '#56844B'}} >
          Vehicle Assignment for Today {todaysDate}
        </p>

        {/* Assign driver button */}
        <CButton 
          onClick={()=>setAssignDriverModalVisble(!assignDriverModalVisible)}
          style={{  
            '--cui-btn-color': 'white',
            '--cui-btn-bg': '#56844B',
            '--cui-btn-border-color': 'transparent',
            '--cui-btn-hover-bg': '#56844B',
            '--cui-btn-hover-border-color': '#56844B',
          }}
          className="px-2 py-2" >
          Assign Driver
        </CButton>

        {/* Assign driver modal */}
        <CModal 
          scrollable 
          visible={assignDriverModalVisible} 
          onClose={() => setAssignDriverModalVisble(false)} 
          style={{marginTop: '40%', marginLeft: '14%'}}>
          <CModalHeader>
            <CModalTitle style={{ color: '#56844B', fontWeight: 'bold', fontSize: '20px'}}>Assign Driver to Vehicle</CModalTitle>
          </CModalHeader>
          <CModalBody>
            <CForm className='overflow-auto'>
              <CFormSelect className='pt-2' onChange={(e) => setSelectedDriverId(e.target.value)}>
                <option value="blankdriver">Select a driver</option>
                {driverTable.map((driver) => (
                <option key={driver.driver_ID} value={driver.driver_ID}>
                  ID: {driver.driver_ID} | Name: {driver.firstName} {driver.lastName}
                </option>
                ))}
              </CFormSelect>
              <div className='pt-4'>
                <CFormSelect onChange={(e) => setSelectedVehicleId(e.target.value)}>
                  <option value="blankvehicle">Select a vehicle</option>
                  {vehicleTable.map((vehicle) => (
                  <option key={vehicle.vehicle_Plate} value={vehicle.vehicle_Plate}>
                  Vehicle plate: {vehicle.vehicle_Plate} | Capacity: {vehicle.capacity}
                  </option>
                  ))}
                </CFormSelect>
              </div>
            </CForm>
          </CModalBody>
          <CModalFooter>
            <Typography>Don't see the driver or vehicle here? Register them in our site first</Typography>
            <div className="d-grid gap-2 col-6 mx-auto">
            <CButton
              style ={{'background': '#56844B'}}
              onClick={handleVehicleAssignment}>
              Confirm 
            </CButton>
            </div>
          </CModalFooter>
        </CModal>
      </div>

      {/* Vehicle assignment table */}
      <Card className="overflow-scroll h-full w-full">
          <CardBody style={{ padding: 0 }}>
            {combinedData.length === 0 ? (
              <Typography className="p-4">No vehicle assignments</Typography>
            ) : (
              <table className="w-full min-w-max table-auto text-left">
                <thead className="bg-gray-200">
                  <tr>
                    {TABLE_HEAD.map((head, idx) => (
                      <th key={`${head}-${idx}`} className="border-b border-blue-gray-100 bg-blue-gray-50 p-4">
                        <Typography
                          color="black"
                          className="font-normal leading-none opacity-80">
                          {head}
                        </Typography>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {combinedData
                    .filter((data) => isToday(data.datetime)) // Filter rows with datetime equal to today's date
                    .map(( data, index ) => {
                    const isLast = index === data.length - 1;
                    const classes = isLast ? "p-4" : "p-4 border-b border-blue-gray-50";
                    return (
                      <tr key={data.driver_ID}>
                        <td className={classes}>
                          <Typography variant="small" color="blue-gray" className="font-normal">
                            {data.driver_ID}
                          </Typography>
                        </td>

                        <td className={classes}>
                          <Typography variant="small" color="blue-gray" className="font-normal">
                            {data.firstName} {data.lastName}
                          </Typography>
                        </td>

                        <td className={classes}>
                          <Typography variant="small" color="blue-gray" className="font-normal">
                            {data.vehicle_Plate}
                          </Typography>
                        </td>
                        <td className={classes}>
                          <Typography variant="small" color="blue-gray" className="font-normal">
                            {data.vehicle_Type}
                          </Typography>
                        </td>
                        <td className={classes}>
                          <Typography variant="small" color="blue-gray" className="font-normal">
                            {data.capacity}
                          </Typography>
                        </td>
                        <td className={classes}>
                          <Typography variant="small" color="blue-gray" className="font-normal">
                            {data.datetime}
                          </Typography>
                        </td>
                        <td className={classes}>
                          <a>
                            <Button 
                              variant="outlined"
                              onClick = {(()=> handleViewAssignPickUpModal(data.driver_ID, data.vehicle_Plate, data.capacity))}
                              >
                              Assign to pickup jobs
                            </Button>
                          </a>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                
                {/* Assign to pickup jobs modal */}
                <CModal 
                  scrollable
                  visible={showAssignPickUpJobModal} 
                  onClose={ () => {setShowAssignPickUpJobModal(false); handleResetViewAssignPickUpModal()} } 
                  size ="lg">
                  <CModalHeader>
                    <CModalTitle>
                      <div style={{ color: '#56844B', fontWeight: 'bold', fontSize: '20px'}}>
                        Assign Driver (ID: {selectedDriverIdForPickUpJob}) to pick up job
                      </div>
                    </CModalTitle>
                  </CModalHeader>
                  <CModalBody>
                    <CForm className='overflow-auto'>
                      <CFormSelect className='pt-2' onChange={(e) => setSelectedSchoolIdForPickUpJob(e.target.value)}>
                        <option value="">Select the School</option>
                        {schoolDataForModal.map((s) => (
                        <option key={s.school_ID} value={s.school_ID}>
                          ID: {s.school_ID} | Name: {s.school_Name}
                        </option>
                        ))}
                      </CFormSelect>
                      <CFormSelect className='mt-4 pt-2' onChange={(e) => setSelectedRegionForPickUpJob(e.target.value)}>
                        <option value="">Select the Region</option>
                        <option value="North">North</option>
                        <option value="West">West</option>
                        <option value="East">East</option>
                        <option value="South">South</option>
                        <option value="Central">Central</option>
                      </CFormSelect>
                      <CFormSelect className='mt-4 pt-2' onChange={(e) => setSelectedTimeSlotForPickUpJob(e.target.value)}>
                        <option value="">Select the Timeslot</option>
                        <option value="2:30pm">2:30pm</option>
                        <option value="5:30pm">5:30pm</option>
                      </CFormSelect>
                    </CForm>
                  </CModalBody>
                  <CModalFooter >
                    <div className="flex flex-col col-10 mx-auto">
                      <div className='text-center'>
                        <Typography variant="h5">Assignment Summary:</Typography>
                      </div>

                      <div className='flex flex-row'>
                        <div className='w-1/3 mr-10'>
                          <Typography variant="h6" className="pt-2">
                            You have selected
                          </Typography>
                          <Typography className="pt-2">
                            Driver: {selectedDriverIdForPickUpJob}
                          </Typography>
                          <Typography className="pt-2">
                            Vehicle: {selectedVehiclePlateForPickUpJob}
                          </Typography>
                          <Typography className="pt-2">
                            Vehicle's Capacity: {selectedVehicleCapacityForPickUpJob}
                          </Typography>
                        </div>
                      
                        {(selectedSchoolIdForPickUpJob ==="" || selectedRegionForPickUpJob ==="" || selectedTimeSlotForPickUpJob ==="") ? (
                          <>
                          </>
                        ) : (
                          <>
                            <div className='w-1/3 mr-10'>
                              <Typography variant="h6" className="pt-2">
                                Assigned to
                              </Typography>
                              <Typography className="pt-2">
                                School: {selectedSchoolIdForPickUpJob}
                              </Typography>
                              <Typography className="pt-2">
                                Region: {selectedRegionForPickUpJob}
                              </Typography>
                              <Typography className="pt-2">
                                Timeslot: {selectedTimeSlotForPickUpJob}
                              </Typography>
                            </div>

                            <div className='flex flex-row w-1/3 mt-2'>
                              <div className='mr-10'>
                                <Typography variant="h6">
                                  Unassigned jobs remaining before assignment: {jobsRemaining}
                                </Typography>
                              </div>
                              <div>
                                <Typography variant="h6">
                                  Unassigned jobs remaining after assignment: {calculateRemainingCapacity()}
                                </Typography>
                              </div>
                            </div>
                          </>
                        )}
                      </div>

                      <div>
                        <CButton
                          className='mt-4'
                          style ={{'background': '#56844B', width: '100%'}}
                          onClick={handlePickUpJobAssignment}>
                          Assign Now
                        </CButton>
                      </div>
                    </div>
                  </CModalFooter>
                </CModal>
              </table>
            )}
          </CardBody>
      </Card>
    </>
  )
}