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

export default function ParentTable() {
  //  VIEW PARENT DATA START  //
  const TABLE_HEAD = ["PARENT ID", "FIRST NAME", "LAST NAME", "EMAIL", "CONTACT NO", "ADDRESS", "SUBSCRIPTION", "", ""];

  const [tableData, setTableData] = useState([]);
  const schoolid = localStorage.getItem('schoolid');

  useEffect(() => {
    axios.get(`https://lagj9paot7.execute-api.ap-southeast-1.amazonaws.com/dev/api/schadm-getparent/${schoolid}`)
      .then(res => {
        setTableData(res.data)
      })
      .catch(err => {
        console.error(err);
      })
  }, []);
  //  VIEW PARENT DATA END  //


  // CREATE FUNCTION START //
  const [createModalVisible, setCreateModalVisible] = useState(false)
  const [ userId, setUserId ] = useState('');
  const [ password, setPassword ] = useState('');
  const [ firstName, setFirstName ] = useState('');
  const [ lastName, setLastName ] = useState('');
  const [ email, setEmail ] = useState('');
  const [ contactno, setContactno ] = useState('');
  const [ address, setAddress ] = useState('');
  const [ subscription, setSubscription ] = useState('Normal'); // By default, parents have 'Normal' status untill they personally subscribe

  // Method to clear the create parent inputs
  const handleClearForm = () => {
    setUserId('')
    setPassword('')
    setFirstName('')
    setLastName('')
    setEmail('')
    setContactno('')
    setAddress('')
  };

  // Handle create parent
  const handleCreateParent = async () => {
    try {
      // Basic frontend validation first, before sending post request
      // If any of the input fields are are empty, do not proceed with axios post req. 
      if (!userId.trim() || !password.trim() || !firstName.trim() || !lastName.trim() || !email.trim() || !address.trim() || !contactno.trim()) {
        alert('Fill in all fields first before creating the account')
        return;
      }
      
      // Else proceed with post request
      const res = await axios.post('https://lagj9paot7.execute-api.ap-southeast-1.amazonaws.com/dev/api/schadm-createparent', { ui: userId, p: password, fn: firstName, ln: lastName, e: email, cn: contactno, a: address, s: subscription, si: schoolid });

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
  // Variables that will be used in the update parent modal
  const [updateModalVisible, setUpdateModalVisible] = useState(false);
  const [updatedFirstname, setUpdatedFirstname] = useState('');
  const [updatedLastname, setUpdatedLastname] = useState('');
  const [updatedEmail, setUpdatedEmail] = useState('');
  const [updatedContactNo, setUpdatedContactNo] = useState('');
  const [updatedAddress, setUpdatedAddress] = useState('');

  const showUpdateModal = ( userid, firstname, lastname, email, contactno, address, subscription ) => {
    setUserId(userid);
    setUpdatedFirstname(firstname);
    setUpdatedLastname(lastname);
    setUpdatedEmail(email);
    setUpdatedContactNo(contactno)
    setUpdatedAddress(address);
    setSubscription(subscription)
    setUpdateModalVisible(true);
  };
  
  // Handle updating parent details
  const handleUpdateParent = async () => {
    try {
      // Validation
      // Check that inputs are different from table row data before proceeding with update query in axios put
      // Find the specific row data based on the userid (which was set by state hook)
      const rowData = tableData.find(data => data.parent_ID === userId);
      const isUpdated = updatedFirstname !== rowData.firstName || updatedLastname !== rowData.lastName || updatedEmail !== rowData.email || updatedContactNo !== rowData.contactNo || updatedAddress !== rowData.address;

      if (!isUpdated) {
        alert('No changes made. Change either the name, email, contact number or address first before updating');
        return;
      }

      const res = await axios.put('https://lagj9paot7.execute-api.ap-southeast-1.amazonaws.com/dev/api/schadm-updateparent', { 
        ui: userId, ufn: updatedFirstname, uln: updatedLastname, ue: updatedEmail, ucn: updatedContactNo, ua: updatedAddress
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
  // Hook to toggle visibility of delete parent modal, and to store the user id that was selected by user
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deletingUserId, setDeletingUserId] = useState('');   

  const showDeleteConfirmation = (userid) => {
    setDeleteModalVisible(true);
    setDeletingUserId(userid);
  };

  // Handle the deletion of an parent account
  const handleDeleteParent = async () => {
    try {
      const res = await axios.delete('https://lagj9paot7.execute-api.ap-southeast-1.amazonaws.com/dev/api/schadm-deleteparent', { data: { deletingUserId }, });

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


  // NAVIGATE TO UPLOAD PARENT UI
  const navigate = useNavigate(); 
  const navigateToUploadparent = async () => {
    navigate('/school-admin/uploadparent')
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
          Parent User Accounts
        </p>

        {/* Upload Parent Accounts Button */}
        <CButton 
          onClick={(navigateToUploadparent)}
          style={{  
            '--cui-btn-color': 'white',
            '--cui-btn-bg': '#56844B',
            '--cui-btn-border-color': 'transparent',
            '--cui-btn-hover-bg': '#56844B',
            '--cui-btn-hover-border-color': '#56844B',
          }}
          className="px-2 py-2" 
        >
          Upload Parents
        </CButton>
        
        {/* Create Parent Account Button */}
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
            Create Parent 
          </CButton>
        </div>

        {/* Create Parent Account Modal */}
        <CModal scrollable visible={createModalVisible} onClose={() => setCreateModalVisible(false)} backdrop="static">
          <CModalHeader>
            <CModalTitle style={{ color: '#56844B', fontWeight: 'bold', fontSize: '20px'}}>Create Parent Account</CModalTitle>
          </CModalHeader>
          <CModalBody>
            <CForm className='overflow-auto'>
              <CFormLabel>Creating parent account for school</CFormLabel>
              <CFormInput 
                value={schoolid} 
                className='mb-2'
                disabled
              />
              <CFormLabel>Parent ID</CFormLabel>
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
              <CFormLabel>Contact No</CFormLabel>
              <CFormInput 
                value={contactno}
                onChange={(e) => setContactno(e.target.value)}
                className='mb-2'
              />           
              <CFormLabel>Address</CFormLabel>
              <CFormInput 
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className='mb-2'
              />
              <CFormLabel>Subscription</CFormLabel>
              <CFormInput 
                value={subscription}
                className='mb-2'
                disabled
              />
            </CForm>
          </CModalBody>
          <CModalFooter className="d-flex justify-content-center">
            <CButton 
              style ={{'background': '#56844B', width: '70%'}}
              onClick={handleCreateParent}
            >
              Create Parent Account  
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
          placeholder="Search parent user ID"
        />
      </div>

      {/* Parent Accounts Overview Table */}
      <Card className="overflow-scroll h-full w-full">
        <CardBody style={{ padding: 0 }}>
          {tableData.length === 0 ? (
            <Typography className="p-4">No parent accounts</Typography>
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
                  .filter((row) => row.parent_ID.toLowerCase().includes(searchQuery.toLowerCase()))  // .filter for real time search query
                  .slice(startIndex, startIndex + rowsPerPage)  // .slice for pagination
                  .map(( data, index ) => {
                  const isLast = index === data.length - 1;
                  const classes = isLast ? "p-4" : "p-4 border-b border-blue-gray-50";

                  return (
                    <tr key={data.parent_ID}>
                      <td className={classes}>
                        <Typography variant="small" color="blue-gray" className="font-normal">
                          {data.parent_ID}
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
                          {data.contactNo}
                        </Typography>
                      </td>
                      <td className={classes}>
                        <Typography variant="small" color="blue-gray" className="font-normal">
                          {data.address}
                        </Typography>
                      </td>
                      <td className={classes}>
                        <Typography variant="small" color="blue-gray" className="font-normal">
                          {data.subscription}
                        </Typography>
                      </td>
                      <td className={classes}>
                        <IconButton variant="text" color="blue-gray"
                          onClick={() => showUpdateModal(data.parent_ID, data.firstName, data.lastName, data.email, data.contactNo, data.address, data.subscription)}>
                          <CIcon icon={cilPencil} />
                        </IconButton>
                      </td>
                      <td className={classes}>
                        <Tooltip content="Delete">
                          <IconButton variant="text" color="blue-gray" onClick={() => showDeleteConfirmation(data.parent_ID)}>
                            <TrashIcon className="h-4 w-4" />
                          </IconButton>
                        </Tooltip>
                      </td>
                    </tr>
                  );
                })}

                {/* Update parent account modal */}
                <CModal backdrop='static' scrollable visible={updateModalVisible} onClose={() => setUpdateModalVisible(false)}>
                  <CModalHeader>
                    <CModalTitle style={{ color: '#56844B', fontWeight: 'bold', fontSize: '20px' }}>
                      Update Parent Account
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
                      <CFormLabel>Contact No</CFormLabel>
                      <CFormInput
                        value={updatedContactNo}
                        onChange={(e) => setUpdatedContactNo(e.target.value)}
                        className="mb-2"
                      />
                      <CFormLabel>Address</CFormLabel>
                      <CFormInput
                        value={updatedAddress}
                        onChange={(e) => setUpdatedAddress(e.target.value)}
                        className="mb-2"
                      />
                      <CFormLabel>Subscription</CFormLabel>
                      <CFormInput
                        value={subscription}
                        className="mb-2"
                        disabled
                      />
                    </CForm>
                  </CModalBody>
                  <CModalFooter className="d-flex justify-content-center">
                    <CButton style={{ background: '#56844B', width: '70%' }} onClick={handleUpdateParent}>
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
                    <CButton onClick={handleDeleteParent} color="light">
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