import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import { 
  Card, 
  CardBody, 
  Typography, 
  Tooltip, 
  IconButton,
} from "@material-tailwind/react";
import { 
  CButton,
  CModal,
  CForm,
  CFormInput, 
  CFormLabel,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
} from "@coreui/react";
import { TrashIcon } from "@heroicons/react/24/solid";
import CIcon from '@coreui/icons-react'
import { cilPencil } from "@coreui/icons"
import '../css/defaultstyle.css';
import ConfirmationModal from './ConfirmationModal';

export default function VendorTableViewDrivers() {  
  // VIEW FUNCTION START //
  const TABLE_HEAD = ["DRIVER ID", "FIRST NAME", "LAST NAME", "EMAIL", "CONTACT NO" , "ADDRESS", "LICENSE", "", ""];
  const [tableData, setTableData] = useState([]);

  // Get vendor ID from URL
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const vendor_ID = searchParams.get('vendor_ID');

  useEffect(() => {
    axios.get(`https://lagj9paot7.execute-api.ap-southeast-1.amazonaws.com/dev/api/ven-getdrivers/${vendor_ID}`)
      .then(res => {
        setTableData(res.data)
      })
      .catch(err => {
        console.error(err);
      })
  }, []);
  // VIEW FUNCTION END //


  // CREATE FUNCTION START //
  // Hook to toggle visibility of create driver modal
  const [visible, setVisible] = useState(false)

  const [userid, setUserid] = useState('');
  const [password, setPassword] = useState('');
  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [email, setEmail] = useState('');
  const [contactNo, setContactNo] = useState('');
  const [address, setAddress] = useState('');
  const [license, setLicense] = useState('');

  const handleClearForm = () => {
    setUserid('');
    setPassword('');
    setFirstname('');
    setLastname('');
    setEmail('');
    setContactNo('');
    setAddress();
    setLicense('');
  };

  const handleCreateDriver = async () => {
    try {
      // Basic frontend validation first, before sending post request
      // If either userid, password, firstname, lastname or email is empty, do not proceed with axios post req. 
      if (!userid.trim() || !password.trim() || !firstname.trim() || !lastname.trim() || !email.trim() || !contactNo.trim() || !address.trim() || !license.trim()) {
        alert('Fill in all fields first')
        return;
      }
      // Else proceed with post request, 
      const res = await axios.post('https://lagj9paot7.execute-api.ap-southeast-1.amazonaws.com/dev/api/ven-createdriveraccount', {
         ui: userid, pw: password, fn: firstname, ln:  lastname, e: email, cn: contactNo, a:address, l: license,  vi: vendor_ID 
      });

      const apiresult = res.data;
      if (apiresult.success) {
        alert('Account successfully created')
        handleClearForm();
        window.location.reload();
      } else {
        alert(apiresult.errlog);
      }
    } catch (err) {
      console.error(err);
    }
  };
  // CREATE FUNCTION END //


  //  UPDATE FUNCTION START  //
  // Variables that will be used in the update modal
  const [updateModalVisible, setUpdateModalVisible] = useState(false);
  const [userId, setUserId] = useState('');
  const [updatedFirstname, setUpdatedFirstname] = useState('');
  const [updatedLastname, setUpdatedLastname] = useState('');
  const [updatedEmail, setUpdatedEmail] = useState('');
  const [updatedContactNo, setUpdatedContactNo] = useState('');
  const [updatedAddress, setUpdatedAddress] = useState('');
  const [updatedLicense, setUpdatedLicense] = useState('');

  const showUpdateModal = ( userid, firstname, lastname, email, contactNo, address, license) => {
    setUserId(userid);
    setUpdatedFirstname(firstname);
    setUpdatedLastname(lastname);
    setUpdatedEmail(email);
    setUpdatedContactNo(contactNo);
    setUpdatedAddress(address);
    setUpdatedLicense(license);
    setUpdateModalVisible(true);
  };
  
  // Handle updating driver details
  const handleUpdateDriver = async () => {
    try {
      // Perform basic validation
      // Check that atleast firstname,lastname, email or license inputs are different from table row data before proceeding with update query in axios put
      // Find the specific row data based on the userId (which was set by state hook)
      const rowData = tableData.find(data => data.driver_ID === userId);
      const isUpdated = updatedFirstname !== rowData.firstName || updatedLastname !== rowData.lastName || updatedEmail !== rowData.email || updatedContactNo !== rowData.contactNo || updatedAddress !== rowData.address || updatedLicense !== rowData.license;

      if (!isUpdated) {
        alert('No changes made. Change either the name, email, contact no, address or license first before updating');
        return;
      }

      const res = await axios.put('https://lagj9paot7.execute-api.ap-southeast-1.amazonaws.com/dev/api/ven-updatedriveraccount', {
        ui: userId,
        ufn: updatedFirstname,
        uln: updatedLastname,
        ue: updatedEmail,
        ucn: updatedContactNo,
        ua: updatedAddress,
        ul: updatedLicense,
      });
  
      // Handle the response
      const apiResult = res.data;
      if (apiResult.success) {
        alert('Account successfully updated');
        setUpdateModalVisible(false);
        window.location.reload();
      } else {
        alert(apiResult.errlog);
      }
    } catch (err) {
      console.error(err);
    }
  };  
  // UPDATE FUNCTION END  //


  //  DELETE FUNCTION START  //
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deletingUserId, setDeletingUserId] = useState('');   

  const showDeleteConfirmation = (userid) => {
    setDeleteModalVisible(true);

    setDeletingUserId(userid);
  };

  const handleDeleteDriver = async () => {
    try {
      const res = await axios.delete('https://lagj9paot7.execute-api.ap-southeast-1.amazonaws.com/dev/api/ven-deletedriveraccount', { data: { deletingUserId } });

      const apiResult = res.data;
      if (apiResult.success) {
        alert('Account successfully deleted');
        window.location.reload();
      } else {
        alert(apiResult.errlog);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDeleteModalVisible(false);
      window.location.reload();
    }
  };
  //  DELETE FUNCTION END //

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <p 
          className="font-bold text-lg"
          style={{ fontSize: '20px', color: '#56844B'}} >
          Driver Account Management
        </p>

        {/* Create driver button */}
        <CButton 
          onClick={() => setVisible(!visible)}
          style={{
            '--cui-btn-color': 'white',
            '--cui-btn-bg': '#56844B',
            '--cui-btn-border-color': 'transparent',
            '--cui-btn-hover-bg': '#56844B',
            '--cui-btn-hover-border-color': '#56844B',
          }}
          className="px-5 py-2" >
          Create Driver
        </CButton>

        {/* Create driver modal */}
        <CModal scrollable visible={visible} onClose={() => setVisible(false)}>
          <CModalHeader>
            <CModalTitle style={{ color: '#56844B', fontWeight: 'bold', fontSize: '20px'}}>Create Driver Account</CModalTitle>
          </CModalHeader>
          <CModalBody>
            <CForm className='overflow-auto'>
              <CFormLabel>Creating driver account for vendor ID</CFormLabel>
              <CFormInput 
                value={vendor_ID.toString()} 
                disabled
                className='mb-2'
              />

              <CFormLabel>User ID</CFormLabel>
              <CFormInput 
                value={userid}
                onChange={(e) => setUserid(e.target.value)}
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
                value={firstname}
                onChange={(e) => setFirstname(e.target.value)}
                className='mb-2'
              />
              <CFormLabel>Last Name</CFormLabel>
              <CFormInput 
                value={lastname}
                onChange={(e) => setLastname(e.target.value)}
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
                value={contactNo}
                onChange={(e) => setContactNo(e.target.value)}
                className='mb-2'
              />
              <CFormLabel>Address</CFormLabel>
              <CFormInput 
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className='mb-2'
              />
              <CFormLabel>License</CFormLabel>
              <CFormInput 
                value={license}
                onChange={(e) => setLicense(e.target.value)}
                className='mb-2'
              />
            </CForm>
          </CModalBody>
          <CModalFooter className="d-flex justify-content-center">
            <CButton 
              style ={{'background': '#56844B', width: '70%'}}
              onClick={handleCreateDriver}>
              Create
            </CButton>
            <CButton 
              color='light'
              style ={{ width: '70%'}}
              onClick={handleClearForm}>
              Clear Form
            </CButton>
          </CModalFooter>
        </CModal>
      </div>

      <Card className="overflow-scroll h-full w-full">
        <CardBody style={{ padding: 0 }}>
          {tableData.length === 0 ? 
          (
            <Typography className="p-4">
              No driver accounts with this vendor
            </Typography>
          ) 
          : 
          (
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
                {tableData.map(( data, index ) => {
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
                          {data.license}
                        </Typography>
                      </td>

                      <td className={classes}>
                        <IconButton variant="text" color="blue-gray"
                          onClick={() => showUpdateModal(data.driver_ID, data.firstName, data.lastName, data.email,data.contactNo, data.address, data.license)}>
                          <CIcon icon={cilPencil} />
                        </IconButton>
                      </td>

                      <td className={classes}>
                        <Tooltip content="Delete">
                          <IconButton variant="text" color="blue-gray" onClick={() => showDeleteConfirmation(data.driver_ID)}>
                            <TrashIcon className="h-4 w-4" />
                          </IconButton>
                        </Tooltip>
                      </td>
                    </tr>
                  );
                })}

                {/* Update driver modal */}
                <CModal backdrop='static' scrollable visible={updateModalVisible} onClose={() => setUpdateModalVisible(false)}>
                  <CModalHeader>
                    <CModalTitle style={{ color: '#56844B', fontWeight: 'bold', fontSize: '20px' }}>
                      Update Driver Account
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
                      <CFormLabel>License</CFormLabel>
                      <CFormInput
                        value={updatedLicense}
                        onChange={(e) => setUpdatedLicense(e.target.value)}
                        className="mb-2"
                      />                      
                    </CForm>
                  </CModalBody>
                  <CModalFooter className="d-flex justify-content-center">
                    <CButton style={{ background: '#56844B', width: '70%' }} onClick={handleUpdateDriver}>
                      Update
                    </CButton>
                    <CButton color="light" style={{ width: '70%' }} onClick={() => setUpdateModalVisible(false)}>
                      Cancel
                    </CButton>
                  </CModalFooter>
                </CModal>

                {/* Delete confirmation modal */}
                <ConfirmationModal
                  visible={deleteModalVisible}
                  onClose={() => setDeleteModalVisible(false)}
                  onConfirm={handleDeleteDriver}
                  callingComponent="VendorTableViewDrivers"
                />
              </tbody>
            </table>
          )}
        </CardBody>
      </Card>
    </>
  );
}