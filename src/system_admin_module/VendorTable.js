import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Card, 
  CardBody, 
  CardFooter,
  Typography, 
  Tooltip, 
  IconButton,
  Input,
  Button,
} from "@material-tailwind/react";
import { CButton, CModal, CModalHeader, CModalTitle, CModalBody, CForm, CFormLabel, CFormInput, CModalFooter, } from '@coreui/react';
import { TrashIcon } from "@heroicons/react/24/solid";
import '../css/defaultstyle.css';
import ConfirmationModal from './ConfirmationModal';

export default function VendorTable() {
  //  VIEW FUNCTION START  //
  const TABLE_HEAD = ["VENDOR ID", "VENDOR NAME", "ADDRESS", "EMAIL", "CONTACT NO", "SCHOOL PARTNERED WITH", "", ""];
  const [tableData, setTableData] = useState([]);
  const [schoolVendorAssoc, setSchoolVendorAssoc] = useState([]);

  useEffect(() => {
    axios.get('https://lagj9paot7.execute-api.ap-southeast-1.amazonaws.com/dev/api/sysadm-getvendor')
      .then(res => {
        setTableData(res.data)
      })
      .catch(err => {
        console.error(err);
      })
  }, []);

  useEffect(() => {
    if (tableData.length === 0) {
      // If tableData is empty, do not make the POST request
      return;
    }
    // Get all the vendor IDs from tableData
    const vendorIDs = tableData.map((item) => item.vendor_ID);
    
    axios.post('https://lagj9paot7.execute-api.ap-southeast-1.amazonaws.com/dev/api/sysadm-getassociatedschoolsforeachvendor', {
      vendorIDs: vendorIDs,
    })
    .then((getAssocSchoolRes) => {
      setSchoolVendorAssoc(getAssocSchoolRes.data)
    })
    .catch((err) => {
      console.error(err);
    });
  }, [tableData]);

  // Navigate hook, is used when user clicks on 'view drivers'
  const navigate = useNavigate(); 
  const handleViewDrivers = (vendor_ID) => {
    navigate(`/system-admin/vendor/viewdrivers?vendor_ID=${vendor_ID}`);
  };
  //  VIEW FUNCTION END  //


  // CREATE FUNCTION START //
  const [visible, setVisible] = useState(false)
  const [vendorId, setVendorId] = useState('')
  const [password, setPassword] = useState('')
  const [vendorName, setVendorName] = useState('')
  const [address, setAddress] = useState('')
  const [email, setEmail] = useState('')
  const [contactNo, setContactNo] = useState('')

  const handleClearForm = () => {
    setVendorId('')
    setPassword('')
    setVendorName('')
    setAddress('')
    setEmail('')
    setContactNo('')
  }

  const handleCreateVendor = () => {
    try {
      // basic validation
      if (!vendorId.trim() || !password.trim() || !vendorName.trim() || !address.trim() || !email.trim() || !contactNo.trim()) {
        alert('Fill in all fields first')
      }

      axios.post('https://lagj9paot7.execute-api.ap-southeast-1.amazonaws.com/dev/api/sysadm-createvendor', {
        vi: vendorId,
        p: password,
        vn: vendorName,
        a: address,
        e: email,
        cn: contactNo,
      })
      .then(createVenRes=>{
        if(createVenRes.data.success) {
          alert('Vendor successfully created')
          handleClearForm()
          window.location.reload()
        } else {
          alert(createVenRes.data.errlog)
        }
      })

    } catch (err) {
      console.error(err)
    }
  }
  // CREATE FUNCTION END //


  //  DELETE FUNCTION START //
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deletingVendorId, setDeletingVendorId] = useState('');  

  const showDeleteConfirmation = (vendorid) => {
    setDeleteModalVisible(true);
    setDeletingVendorId(vendorid);
  };

  const handleDeleteVendor = async () => {
    try {
      const res = await axios.delete('https://lagj9paot7.execute-api.ap-southeast-1.amazonaws.com/dev/api/sysadm-deletevendor', { data: { deletingVendorId } });
 
      const apiResult = res.data;
      if (apiResult.success) {
        alert('Vendor successfully deleted');
        window.location.reload();
      } else {
        alert(apiResult.errlog);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDeleteModalVisible(false);
    }
  }
  // DELETE FUNCTION END  //


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
          className="font-bold text-lg"
          style={{ fontSize: '20px', color: '#56844B'}} >
          Vendor Account Management
        </p>

          {/* Create vendor button */}
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
          Create Vendor
        </CButton>

        {/* Create vendor modal */}
        <CModal scrollable visible={visible} onClose={() => setVisible(false)}>
          <CModalHeader>
            <CModalTitle style={{ color: '#56844B', fontWeight: 'bold', fontSize: '20px'}}>Create Vendor</CModalTitle>
          </CModalHeader>
          <CModalBody>
            <CForm className='overflow-auto'>

              <CFormLabel>Vendor ID</CFormLabel>
              <CFormInput 
                value={vendorId}
                onChange={(e) => setVendorId(e.target.value)}
                className='mb-2'
              />
              <CFormLabel>Password</CFormLabel>
              <CFormInput 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className='mb-2'
              />
              <CFormLabel>Vendor Name</CFormLabel>
              <CFormInput 
                value={vendorName}
                onChange={(e) => setVendorName(e.target.value)}
                className='mb-2'
              />
              <CFormLabel>Address</CFormLabel>
              <CFormInput 
                value={address}
                onChange={(e) => setAddress(e.target.value)}
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
            </CForm>
          </CModalBody>
          <CModalFooter className="d-flex justify-content-center">
            <CButton 
              style ={{'background': '#56844B', width: '70%'}}
              onClick={handleCreateVendor}>
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

      {/* Search box */}
      <div className='py-4'>
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search vendor ID"
        />
      </div>

      <Card className="overflow-scroll h-full w-full">
        <CardBody style={{ padding: 0 }}>
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
                .filter((row) => row.vendor_ID.toLowerCase().includes(searchQuery.toLowerCase()))  // .filter for real time search query
                .slice(startIndex, startIndex + rowsPerPage)  // .slice for pagination
                .map(( data, index ) => {
                const isLast = index === data.length - 1;
                const classes = isLast ? "p-4" : "p-4 border-b border-blue-gray-50";

                // Find the associated schools for the current vendor
                const associatedSchools = schoolVendorAssoc.filter((item) => item.vendor_ID === data.vendor_ID);
                const schoolNames = associatedSchools.map((item) => item.school_ID).join(", ");

                return (
                  <tr key={data.vendor_ID}>
                    <td className={classes}>
                      <Typography variant="small" color="blue-gray" className="font-normal">
                        {data.vendor_ID}
                      </Typography>
                    </td>
                    <td className={classes}>
                      <Typography variant="small" color="blue-gray" className="font-normal">
                        {data.vendor_Name}
                      </Typography>
                    </td>
                    <td className={classes}>
                      <Typography variant="small" color="blue-gray" className="font-normal">
                        {data.address}
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
                        {schoolNames}
                      </Typography>
                    </td>
                    <td className={classes}>
                      <Typography as="a" variant="small" color="blue" className="font-medium" 
                        onClick={() => handleViewDrivers(data.vendor_ID)} >
                        View drivers
                      </Typography>
                    </td>
                    <td className={classes}>
                      <Tooltip content="Delete">
                        <IconButton variant="text" color="blue-gray" onClick={() => showDeleteConfirmation(data.vendor_ID)}>
                          <TrashIcon className="h-4 w-4" />
                        </IconButton>
                      </Tooltip>
                    </td>
                  </tr>
                );
              })}
              
              {/* Delete confirmation modal */}
              <ConfirmationModal
                visible={deleteModalVisible}
                onClose={() => setDeleteModalVisible(false)}
                onConfirm={handleDeleteVendor}
                callingComponent="VendorTable"
              />
            </tbody>
          </table>
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