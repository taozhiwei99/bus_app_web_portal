import { React, useState, useEffect } from 'react'
import axios from 'axios'
import {
  Card,
  CardBody,
  Typography,
  Tooltip,
  IconButton,
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
import { TrashIcon } from "@heroicons/react/24/solid"
import '../css/defaultstyle.css'

export default function GateAssignment() {
  // VIEW ASSIGNMENT START //
  const [teacherTable, setTeacherTable] = useState([]);
  const [gateTable, setGateTable] = useState([]);
  const [gateAssignments, setGateAssignments] = useState([]);
  const [combinedData, setCombinedData] = useState([]);

  const TABLE_HEAD = ["TEACHER ID", "NAME", "CONTACT", "GATE ID","GATE NAME", "DATE ASSIGNED", ""];

  // Get all gates and teachers associated with the school
  useEffect(() => {
    const schoolid = localStorage.getItem('schoolid');
    Promise.all([
      axios.get(`https://lagj9paot7.execute-api.ap-southeast-1.amazonaws.com/dev/api/schadm-getschoolgates/${schoolid}`),
      axios.get(`https://lagj9paot7.execute-api.ap-southeast-1.amazonaws.com/dev/api/schadm-getteachers/${schoolid}`)
    ])
      .then(([gateRes, teacherRes]) => {
        setGateTable(gateRes.data);
        setTeacherTable(teacherRes.data);
      })
      .catch(err => {
        console.error(err);
      });
  }, []);

  // Get all gate assignments associated with the teacher IDs
  useEffect(() => {
    const schoolid = localStorage.getItem('schoolid');
    axios.get(`https://lagj9paot7.execute-api.ap-southeast-1.amazonaws.com/dev/api/schadm-getgateassignments/${schoolid}`)
      .then((response) => {
        setGateAssignments(response.data);
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);

  // Combine the data from teacherTable, gateTable, and gateAssignments
  useEffect(() => {
    const combinedDataArray = [];
    teacherTable.forEach((teacher) => {
      const { teacher_ID, firstName, lastName, email, contactNo } = teacher;
      const teacherAssignments = gateAssignments.filter((assignment) => assignment.teacher_ID === teacher_ID);
      teacherAssignments.forEach((assignment) => {
        const { gate_ID, datetime } = assignment;
        const assignedGate = gateTable.find((gate) => gate.gate_ID === gate_ID);
        const { gate_Name } = assignedGate || { gate_Name: '' };
  
        // Create an object for each row with named properties
        const rowData = {
          teacher_ID,
          firstName,
          lastName,
          email,
          contactNo,
          gate_ID,
          gate_Name,
          datetime,
        };
        combinedDataArray.push(rowData);
      });
    });
    setCombinedData(combinedDataArray);
  }, [teacherTable, gateTable, gateAssignments]);
  // VIEW ASSIGNMENT END //


  // ASSIGN TEACHER START //
  const [assignTeacherModalVisible, setAssignTeacherModalVisble] = useState(false);
  const [selectedTeacherId, setSelectedTeacherId] = useState('');
  const [selectedGateId, setSelectedGateId] = useState('');

  const handleGateAssignment = async () => {
    // Validation, check if user actually selected a teacher and a gate
    if (!selectedTeacherId.trim() || !selectedGateId.trim()) {
      alert("Please select a teacher and/or a gate first.");
      return;
    }
    // Proceed with creating assignment
    // IMPORTANT, datetime to-be inserted into DB must add 8 hours due to Singapore's timezone GMT +8
    const datetime = new Date();
    datetime.setHours(datetime.getHours() + 8);
    const formattedDatetime = datetime.toISOString();
    // IMPORTANT

    axios.post('https://lagj9paot7.execute-api.ap-southeast-1.amazonaws.com/dev/api/schadm-creategateassignment', { 
      gateid: selectedGateId, 
      teacherid: selectedTeacherId, 
      formattedDatetime: formattedDatetime })
      .then(res => {
        if (res.data.success === true) {
          alert("Teacher successfully assigned to the gate.");
          window.location.reload();
        } else {
          alert("Assignment unsuccessful, the teacher you selected has been already assigned to a gate today.");
        }
      })
      .catch(err => {
        console.error(err);
        alert("An error occurred while assigning the teacher to the gate. Please try again later.");
      });
  };
  // ASSIGN TEACHER END //


  // DELETE ASSIGNMENT START //
  const [deleteModalVisible, setDeleteModalVisible] = useState(false)
  const [deletingGateId, setDeletingGateId] = useState('')
  const [deletingTeacherId, setDeletingTeacherId] = useState('')
  const [deletingDatetime, setDeletingDatetime] = useState('')

  const showDeleteConfirmation = (gateid, teacherid, datetime) => {
    setDeletingGateId(gateid)
    setDeletingTeacherId(teacherid)
    setDeletingDatetime(datetime)
    setDeleteModalVisible(true)
  }
  
  const handleDeleteGateAssignment = () => {
    axios.post('https://lagj9paot7.execute-api.ap-southeast-1.amazonaws.com/dev/api/schadm-deletegateassignment', {
      dgi: deletingGateId,
      dti: deletingTeacherId,
      ddt: deletingDatetime,
    })
    .then(deleteRes => {
      if (deleteRes.data.success) {
        alert("Gate assignment has been successfully deleted")
        window.location.reload()
      } else {
        alert(deleteRes.data.message)
      }
    })
    .catch(err => {
      console.error(err)
    })
  }
  // DELETE ASSIGNMENT END //

  // Function to check if given date = todays date, used in filtering table
  const isToday = (date) => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0'); 
    const day = String(today.getDate()).padStart(2, '0'); 
    const todayDate = `${year}-${month}-${day}`;
    const givenDate = new Date(date);
    const formattedGivenDate = givenDate.toISOString().substring(0, 10);;
    return (
      formattedGivenDate === todayDate
    );
  };

  // Function to format the date as "30 July 2023"
  const [todaysDate, setTodaysDate] = useState('');
  useEffect(() => {
    const formatDate = (date) => {
      const options = { day: 'numeric', month: 'long', year: 'numeric' };
      return new Intl.DateTimeFormat('en-US', options).format(date);
    };
    // Get today's date
    const today = new Date();
    // Format today's date
    const formattedDate = formatDate(today);
    // Set the formatted date in the state
    setTodaysDate(formattedDate);
  }, []);

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <p 
          className="font-bold text-lg"
          style={{ fontSize: '20px', color: '#56844B'}} >
          Gate Assignment for {todaysDate}
        </p>

        {/* Assign teacher button */}
        <CButton 
          onClick={()=>setAssignTeacherModalVisble(!assignTeacherModalVisible)}
          style={{  
            '--cui-btn-color': 'white',
            '--cui-btn-bg': '#56844B',
            '--cui-btn-border-color': 'transparent',
            '--cui-btn-hover-bg': '#56844B',
            '--cui-btn-hover-border-color': '#56844B',
          }}
          className="px-2 py-2" >
          Assign Teacher
        </CButton>

        {/* Assign teacher modal */}
        <CModal 
          scrollable 
          visible={assignTeacherModalVisible} 
          onClose={() => setAssignTeacherModalVisble(false)} 
          style={{marginTop: '40%', marginLeft: '14%'}}>
          <CModalHeader>
            <CModalTitle style={{ color: '#56844B', fontWeight: 'bold', fontSize: '20px'}}>Assign Teacher</CModalTitle>
          </CModalHeader>
          <CModalBody>
            <CForm className='overflow-auto'>
              <CFormSelect className='pt-2' onChange={(e) => setSelectedTeacherId(e.target.value)}>
                <option value="blankteacher">Select a teacher</option>
                {teacherTable.map((teacher) => (
                <option key={teacher.teacher_ID} value={teacher.teacher_ID}>
                  ID: {teacher.teacher_ID} | Name: {teacher.firstName} {teacher.lastName}
                </option>
                ))}
              </CFormSelect>
              <div className='pt-4'>
                <CFormSelect onChange={(e) => setSelectedGateId(e.target.value)}>
                  <option value="blankgate">Select a gate</option>
                  {gateTable.map((gate) => (
                  <option key={gate.gate_ID} value={gate.gate_ID}>
                  ID: {gate.gate_ID} | {gate.gate_Name}
                  </option>
                  ))}
                </CFormSelect>
              </div>
            </CForm>
          </CModalBody>
          <CModalFooter>
            <Typography>Don't see the teacher or gate here? Register them in our site first</Typography>
            <div className="d-grid gap-2 col-6 mx-auto">
            <CButton
              style ={{'background': '#56844B'}}
              onClick={handleGateAssignment}>
              Confirm 
            </CButton>
            </div>
          </CModalFooter>
        </CModal>
      </div>

      {/* Gate assignment table */}
      <Card className="overflow-scroll h-full w-full">
          <CardBody style={{ padding: 0 }}>
            {combinedData.length === 0 ? (
              <Typography className="p-4">No gate assignments</Typography>
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
                      <tr key={data.teacher_ID}>
                        <td className={classes}>
                          <Typography variant="small" color="blue-gray" className="font-normal">
                            {data.teacher_ID}
                          </Typography>
                        </td>
                        <td className={classes}>
                          <Typography variant="small" color="blue-gray" className="font-normal">
                            {data.firstName} {data.lastName}
                          </Typography>
                        </td>
                        <td className={classes}>
                          <Typography variant="small" color="blue-gray" className="font-normal">
                            {data.contactNo}
                          </Typography>
                        </td>
                        <td className={classes}>
                          <Typography variant="small" color="blue-gray" className="font-normal">
                            {data.gate_ID}
                          </Typography>
                        </td>
                        <td className={classes}>
                          <Typography variant="small" color="blue-gray" className="font-normal">
                            {data.gate_Name}
                          </Typography>
                        </td>
                        <td className={classes}>
                          <Typography variant="small" color="blue-gray" className="font-normal">
                            {data.datetime}
                          </Typography>
                        </td>
                        <td className={classes}>
                          <Tooltip content="Delete">
                            <IconButton variant="text" color="blue-gray" onClick={() => showDeleteConfirmation(data.gate_ID, data.teacher_ID, data.datetime)}>
                              <TrashIcon className="h-4 w-4" />
                            </IconButton>
                          </Tooltip>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}

            {/* Delete confirmation modal */}
            <CModal scrollable visible={deleteModalVisible} onClose={() => setDeleteModalVisible(false)}>
              <CModalHeader>
                <CModalTitle style={{ color: '#56844B', fontWeight: 'bold', fontSize: '20px' }}>
                  Confirm Deletion
                </CModalTitle>
              </CModalHeader>
              <CModalBody>
                <p>Are you sure you want to delete this gate assignment?</p>
              </CModalBody>
              <CModalFooter>
                <CButton onClick={handleDeleteGateAssignment} color="light">
                  Confirm
                </CButton>
                <CButton onClick={() => setDeleteModalVisible(false)} color="secondary">
                  Cancel
                </CButton>
              </CModalFooter>
            </CModal>

          </CardBody>
      </Card>

    </>
  )
}