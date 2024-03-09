import React from 'react'
import axios from 'axios'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
import { cilPencil } from "@coreui/icons"
import CIcon from '@coreui/icons-react'
import {
  CButton,
  CModal,
  CForm,
  CFormLabel,
  CFormInput,
  CModalBody,
  CModalHeader,
  CModalTitle,
  CModalFooter,
  CFormSelect,
} from '@coreui/react'
import '../css/defaultstyle.css'
import {
  Card,
  CardBody,
  CardFooter,
  Button,
  Typography,
  Tooltip,
  IconButton,
  Input,
} from '@material-tailwind/react'
import { TrashIcon } from "@heroicons/react/24/solid"

export default function TeacherTable() {
  //  VIEW FUNCTION START  //
  const TABLE_HEAD = ["USER ID", "FIRST NAME", "LAST NAME", "EMAIL", "ADDRESS", "CONTACT NO", "FORM CLASS", "", ""];

  const [tableData, setTableData] = useState([]);
  const schoolid = localStorage.getItem('schoolid');

  useEffect(() => {
    axios.get(`https://lagj9paot7.execute-api.ap-southeast-1.amazonaws.com/dev/api/schadm-getteachers/${schoolid}`)
      .then(res => {
        setTableData(res.data)
      })
      .catch(err => {
        console.error(err);
      })
  }, []);
  //  VIEW FUNCTION END  //





  // CREATE FUNCTION START //
  // Hook to toggle visibility of create teacher modal
  const [createModalVisible, setCreateModalVisible] = useState(false)
  const [classData, setClassData] = useState([])
  useEffect(() => {
    axios.get(`https://lagj9paot7.execute-api.ap-southeast-1.amazonaws.com/dev/api/schadm-getclass/${schoolid}`)
      .then(res=> {
        setClassData(res.data)
      })
      .catch(err => {
        console.error(err)
      })
  }, [tableData])

  // Hooks which will save the inputs in the create teacher modal,
  // The inputs will then be submitted to the post request API later
  const [ userId, setUserId ] = useState('');
  const [ password, setPassword ] = useState('');
  const [ firstName, setFirstName ] = useState('');
  const [ lastName, setLastName ] = useState('');
  const [ email, setEmail ] = useState('');
  const [ address, setAddress ] = useState('');
  const [ contactno, setContactno ] = useState('');
  const [ formClass, setFormClass ] = useState('');

  // Method to clear the create teacher inputs
  const handleClearForm = () => {
    setUserId('')
    setPassword('')
    setFirstName('')
    setLastName('')
    setEmail('')
    setAddress('')
    setContactno('')
    setFormClass('')
  };

  // Handle create teacher
  const handleCreateTeacher = async () => {
    try {
      // Basic frontend validation first, before sending post request
      // If any of the input fields are are empty, do not proceed with axios post req. 
      if (!userId.trim() || !password.trim() || !firstName.trim() || !lastName.trim() || !email.trim() || !address.trim() || !contactno.trim() || !formClass.trim()) {
        alert('Fill in all fields first before creating the account')
        return;
      }
      
      // Else proceed with post request
      const res = await axios.post('https://lagj9paot7.execute-api.ap-southeast-1.amazonaws.com/dev/api/schadm-createteacher', { ui: userId, p: password, fn: firstName, ln: lastName, e: email, a: address, cn: contactno, fc: formClass, si: schoolid });

      // Handle response
      if (res.data.success) {
        alert('Account successfully created')
        handleClearForm();
        setCreateModalVisible(false);
        window.location.reload();
      } else {
        alert(res.data.errlog);
      }
    } catch (err) {
      console.error(err);
    }
  };
  // CREATE FUNCTION END //


  //  UPDATE FUNCTION START  //
  // Variables that will be used in the update teacher modal
  const [updateModalVisible, setUpdateModalVisible] = useState(false);
  // const [userId, setUserId] = useState('');
  const [updatedFirstname, setUpdatedFirstname] = useState('');
  const [updatedLastname, setUpdatedLastname] = useState('');
  const [updatedEmail, setUpdatedEmail] = useState('');
  const [updatedAddress, setUpdatedAddress] = useState('');
  const [updatedContactNo, setUpdatedContactNo] = useState('');
  const [updatedFormclass, setUpdatedFormclass] = useState('');

  // Hook to toggle visibility of update modal,
  // The update modal will be populated with selected row's  teacher data
  const showUpdateModal = ( userid, firstname, lastname, email, address, contactno, formclass ) => {
    setUserId(userid);
    setUpdatedFirstname(firstname);
    setUpdatedLastname(lastname);
    setUpdatedEmail(email);
    setUpdatedAddress(address);
    setUpdatedContactNo(contactno)
    setUpdatedFormclass(formclass);
    setUpdateModalVisible(true);
  };
  
  // Handle updating teacher details
  const handleUpdateTeacher = async () => {
    try {
      // Validation
      // Check that inputs are different from table row data before proceeding with update query in axios put
      // Find the specific row data based on the userid (which was set by state hook)
      const rowData = tableData.find(data => data.teacher_ID === userId);
      const isUpdated = updatedFirstname !== rowData.firstName || updatedLastname !== rowData.lastName || updatedEmail !== rowData.email || updatedFormclass !== rowData.class_ID || updatedAddress !== rowData.address || updatedContactNo !== rowData.contactNo;

      if (!isUpdated) {
        alert('No changes made. Change either the first name, last name, email, address, contact number or form class first before updating');
        return;
      }

      const res = await axios.put('https://lagj9paot7.execute-api.ap-southeast-1.amazonaws.com/dev/api/schadm-updateteacher', { 
        ui: userId, ufn: updatedFirstname, uln: updatedLastname, ue: updatedEmail, ua: updatedAddress, ucn: updatedContactNo, ufc: updatedFormclass, si: schoolid 
      });
      // Handle the response
      if (res.data.success) {
        alert('Account successfully updated');
        setUpdateModalVisible(false);
        window.location.reload();
      } else {
        alert(res.data.errlog)
      }
    } catch (err) {
      console.error(err);
    }
  };
  // UPDATE FUNCTION END  //


  //  DELETE FUNCTION START  //
  // Hook to toggle visibility of delete teacher modal, and to store the user id that was selected by user
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deletingUserId, setDeletingUserId] = useState('');   

  const showDeleteConfirmation = (userid) => {
    setDeleteModalVisible(true);
    setDeletingUserId(userid);
  };

  // Handle the deletion of an teacher account
  const handleDeleteTeacher = async () => {
    try {
      const res = await axios.delete('https://lagj9paot7.execute-api.ap-southeast-1.amazonaws.com/dev/api/schadm-deleteteacher', { data: { dui: deletingUserId }, });

      //Handle response
      if (res.data.success) {
        alert('Account successfully deleted');
        window.location.reload();
      } else {
        alert(res.data.errlog);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDeleteModalVisible(false);
    }
  };
  //  DELETE FUNCTION END //


  // NAVIGATE TO UPLOAD TEACHER UI
  const navigate = useNavigate(); 
  const navigateToUploadteacher = async () => {
    navigate('/school-admin/uploadteacher')
  }

  // Hooks for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;  // number of rows to display
  const startIndex = (currentPage - 1) * rowsPerPage;

  // Hook for search
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <p 
          className="font-bold mr-auto text-lg"
          style={{ fontSize: '20px', color: '#56844B'}} 
        >
          Teacher User Accounts
        </p>

        {/* Upload Teacher Accounts Button */}
        <CButton 
          onClick={(navigateToUploadteacher)}
          style={{  
            '--cui-btn-color': 'white',
            '--cui-btn-bg': '#56844B',
            '--cui-btn-border-color': 'transparent',
            '--cui-btn-hover-bg': '#56844B',
            '--cui-btn-hover-border-color': '#56844B',
          }}
          className="px-2 py-2" 
        >
          Upload Teachers
        </CButton>
        
        {/* Create Teacher Account Button */}
        <div style={{marginLeft: '10px'}}>
          <CButton 
            onClick={() => setCreateModalVisible(!createModalVisible)}
            style={{  
              '--cui-btn-color': 'white',
              '--cui-btn-bg': '#56844B',
              '--cui-btn-border-color': 'transparent',
              '--cui-btn-hover-bg': '#56844B',
              '--cui-btn-hover-border-color': '#56844B',
            }}
            className="px-2 py-2"
          >
            Create Teacher 
          </CButton>
        </div>

        {/* Create Teacher Account Modal */}
        <CModal scrollable visible={createModalVisible} onClose={() => setCreateModalVisible(false)} backdrop="static">
          <CModalHeader>
            <CModalTitle style={{ color: '#56844B', fontWeight: 'bold', fontSize: '20px'}}>Create Teacher Account</CModalTitle>
          </CModalHeader>
          <CModalBody>
            <CForm className='overflow-auto'>
              <CFormLabel>Creating teacher account for school</CFormLabel>
              <CFormInput 
                value={schoolid} 
                className='mb-2'
                disabled
              />
              <CFormLabel>User ID</CFormLabel>
              <CFormInput 
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className='mb-2'
              />
              <CFormLabel>Password</CFormLabel>
              <CFormInput 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className='mb-2'
              />
              <CFormLabel>First Name</CFormLabel>
              <CFormInput 
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className='mb-2'
              />
              <CFormLabel>Last Name</CFormLabel>
              <CFormInput 
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className='mb-2'
              />
              <CFormLabel>Email</CFormLabel>
              <CFormInput 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className='mb-2'
              />
              <CFormLabel>Address</CFormLabel>
              <CFormInput 
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className='mb-2'
              />
              <CFormLabel>Contact No</CFormLabel>
              <CFormInput 
                value={contactno}
                onChange={(e) => setContactno(e.target.value)}
                className='mb-2'
              />
              <CFormLabel className='mb-2'>Form Class</CFormLabel>        
              <CFormSelect onChange={(e) => setFormClass(e.target.value)}>
                <option value="">Select Form Class</option>
                {classData.map((c) => (
                <option key={c.class_ID} value={c.class_ID}>
                ID: {c.class_ID} | {c.class_Name}
                </option>
                ))}
              </CFormSelect>
            </CForm>
          </CModalBody>
          <CModalFooter className="d-flex justify-content-center">
            <CButton 
              style ={{'background': '#56844B', width: '70%'}}
              onClick={handleCreateTeacher}
            >
              Create Teacher Account  
            </CButton>
            <CButton 
              color='light'
              style ={{ width: '70%'}}
              onClick={handleClearForm}
            >
              Clear Form
            </CButton>
          </CModalFooter>
        </CModal>
      </div>

      {/* Search box */}
      <div className='py-4'>
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search teacher user ID"
        />
      </div>

      {/* Teacher Accounts Overview Table */}
      <Card className="overflow-scroll h-full w-full">
        <CardBody style={{ padding: 0 }}>
          {tableData.length === 0 ? (
            <Typography className="p-4">No teacher accounts</Typography>
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
                {tableData
                  .filter((row) => row.teacher_ID.toLowerCase().includes(searchQuery.toLowerCase()))  // .filter for real time search query
                  .slice(startIndex, startIndex + rowsPerPage)  // .slice for pagination
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
                          {data.firstName}
                        </Typography>
                      </td>
                      <td className={classes}>
                        <Typography variant="small" color="blue-gray" className="font-normal">
                          {data.lastName}
                        </Typography>
                      </td>
                      <td className={classes}>
                        <Typography variant="small" color="blue-gray" className="font-normal">
                          {data.email}
                        </Typography>
                      </td>
                      <td className={classes}>
                        <Typography variant="small" color="blue-gray" className="font-normal">
                          {data.address}
                        </Typography>
                      </td>
                      <td className={classes}>
                        <Typography variant="small" color="blue-gray" className="font-normal">
                          {data.contactNo}
                        </Typography>
                      </td>
                      <td className={classes}>
                        <Typography variant="small" color="blue-gray" className="font-normal">
                          {data.class_ID}
                        </Typography>
                      </td>
                      <td className={classes}>
                        <IconButton variant="text" color="blue-gray"
                          onClick={() => showUpdateModal(data.teacher_ID, data.firstName, data.lastName, data.email, data.address, data.contactNo, data.class_ID)}>
                          <CIcon icon={cilPencil} />
                        </IconButton>
                      </td>
                      <td className={classes}>
                        <Tooltip content="Delete">
                          <IconButton variant="text" color="blue-gray" onClick={() => showDeleteConfirmation(data.teacher_ID)}>
                            <TrashIcon className="h-4 w-4" />
                          </IconButton>
                        </Tooltip>
                      </td>
                    </tr>
                  );
                })}

                {/* Update teacher account modal */}
                <CModal backdrop='static' scrollable visible={updateModalVisible} onClose={() => setUpdateModalVisible(false)}>
                  <CModalHeader>
                    <CModalTitle style={{ color: '#56844B', fontWeight: 'bold', fontSize: '20px' }}>
                      Update Teacher Account
                    </CModalTitle>
                  </CModalHeader>
                  <CModalBody>
                    <CForm className="overflow-auto">
                      <CFormLabel>User ID</CFormLabel>
                      <CFormInput 
                        value={userId} 
                        className="mb-2"
                        disabled 
                      />
                      <CFormLabel>First Name</CFormLabel>
                      <CFormInput
                        value={updatedFirstname}
                        onChange={(e) => setUpdatedFirstname(e.target.value)}
                        className="mb-2"
                      />
                      <CFormLabel>Last Name</CFormLabel>
                      <CFormInput
                        value={updatedLastname}
                        onChange={(e) => setUpdatedLastname(e.target.value)}
                        className="mb-2"
                      />
                      <CFormLabel>Email</CFormLabel>
                      <CFormInput
                        value={updatedEmail}
                        onChange={(e) => setUpdatedEmail(e.target.value)}
                        className="mb-2"
                      />
                      <CFormLabel>Address</CFormLabel>
                      <CFormInput
                        value={updatedAddress}
                        onChange={(e) => setUpdatedAddress(e.target.value)}
                        className="mb-2"
                      />
                      <CFormLabel>Contact No</CFormLabel>
                      <CFormInput
                        value={updatedContactNo}
                        onChange={(e) => setUpdatedContactNo(e.target.value)}
                        className="mb-2"
                      />
                      <CFormLabel className='mt-2'>Form Class</CFormLabel>        
                      <CFormSelect onChange={(e) => setUpdatedFormclass(e.target.value)}>
                        <option value={updatedFormclass}>ID: {updatedFormclass}</option>
                        <option value="" disabled>--</option>
                        {classData.map((c) => (
                        <option key={c.class_ID} value={c.class_ID}>
                        ID: {c.class_ID} | {c.class_Name}
                        </option>
                        ))}
                      </CFormSelect>
                    </CForm>
                  </CModalBody>
                  <CModalFooter className="d-flex justify-content-center">
                    <CButton style={{ background: '#56844B', width: '70%' }} onClick={handleUpdateTeacher}>
                      Update
                    </CButton>
                    <CButton color="light" style={{ width: '70%' }} onClick={() => setUpdateModalVisible(false)}>
                      Cancel
                    </CButton>
                  </CModalFooter>
                </CModal>

                {/* Delete confirmation modal */}
                <CModal scrollable visible={deleteModalVisible} onClose={() => setDeleteModalVisible(false)}>
                  <CModalHeader>
                    <CModalTitle style={{ color: '#56844B', fontWeight: 'bold', fontSize: '20px' }}>
                      Confirm Deletion
                    </CModalTitle>
                  </CModalHeader>
                  <CModalBody>
                    <p>Are you sure you want to delete this account?</p>
                  </CModalBody>
                  <CModalFooter>
                    <CButton onClick={handleDeleteTeacher} color="light">
                      Confirm
                    </CButton>
                    <CButton onClick={() => setDeleteModalVisible(false)} color="secondary">
                     Cancel
                    </CButton>
                  </CModalFooter>
                </CModal>
              </tbody>
            </table>
          )}
        </CardBody>

        {/* Pagination for table */}
        <CardFooter className="flex items-center justify-between border-t border-blue-gray-50 p-4">
          <Button 
            variant="outlined" color="blue-gray" 
            size="sm" disabled={currentPage === 1} 
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            Previous
          </Button>
          <div className="flex items-center gap-2">
            {Array.from(Array(Math.ceil(tableData.length / rowsPerPage)).keys()).map((page) => (
              <IconButton
                key={page + 1} variant={currentPage === page + 1 ? "outlined" : "text"}
                color="blue-gray" 
                size="sm"
                onClick={() => setCurrentPage(page + 1)}
              >
                {page + 1}
              </IconButton>
            ))}
          </div>
          <Button
            variant="outlined" color="blue-gray"
            size="sm" disabled={currentPage === Math.ceil(tableData.length / rowsPerPage)}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            Next
          </Button>
        </CardFooter>
      </Card>
    </>
  )
}