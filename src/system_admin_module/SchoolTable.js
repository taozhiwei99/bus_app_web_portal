import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Card, 
  CardBody, 
  Typography, 
  Tooltip, 
  IconButton,
  Input,
  CardFooter,
  Button,
} from "@material-tailwind/react";
import { CButton, CModal, CModalHeader, CModalTitle, CModalBody, CModalFooter, CForm, CFormLabel, CFormInput } from '@coreui/react';
import { TrashIcon } from "@heroicons/react/24/solid";
import '../css/defaultstyle.css';
import ConfirmationModal from './ConfirmationModal';

export default function SchoolTable() {
  //  VIEW FUNCTION START  //
  const TABLE_HEAD = ["SCHOOL ID", "SCHOOL NAME", "SCHOOL ADDRESS", "CONTACT NO", "SCHOOL TYPE", "", ""];
  const [tableData, setTableData] = useState([]);

  useEffect(() => {
    axios.get('https://lagj9paot7.execute-api.ap-southeast-1.amazonaws.com/dev/api/sysadm-getschool')
      .then(res => {
        setTableData(res.data)
      })
      .catch(err => {
        console.error(err);
      })
  }, []);

  // Navigate hook, is used when user clicks on 'view school admin'
  const navigate = useNavigate(); 
  const handleViewSchoolAdmins = (school_ID) => {
    navigate(`/system-admin/school/viewadmins?school_ID=${school_ID}`);
  };
  //  VIEW FUNCTION END //


  // CREATE FUNCTION START //
  const [visible, setVisible] = useState(false)
  const [schoolId, setSchoolId] = useState('')
  const [schoolName, setSchoolName] = useState('')
  const [address, setAddress] = useState('')
  const [contactNo, setContactNo] = useState('')
  const [type, setType] = useState('')

  const [file, setFile] = useState(null);
  const handleFile = (e) => {
      setFile(e.target.files[0]);
  }

  const handleClearForm = () => {
    setSchoolId('')
    setSchoolName('')
    setAddress('')
    setContactNo('')
    setType('')
  }

  const handleCreateSchool = async () => {
    try {
      // basic validation check for empty inputs
      if (!schoolId.trim() || !schoolName.trim() || !address.trim() || !contactNo.trim() || !type.trim()) {
        alert('Fill in all fields first')
        return;
      }
      // School picture not uploaded
      if (file == null) {
        const res = await axios.post('https://lagj9paot7.execute-api.ap-southeast-1.amazonaws.com/dev/api/sysadm-createschool', { 
          si: schoolId,
          sn: schoolName,
          a: address,
          cn: contactNo,
          t: type,
        });

        const apiresult = res.data;
        if (apiresult.success) {
          // School successfully created
          alert('School successfully created')
          handleClearForm();
          window.location.reload();
        } else {
          alert(apiresult.errlog);
        }
      // School picture uploaded
      } else {
        const reader = new FileReader();

        reader.onloadend = () => {
          // convert pdf file into base64 string for upload purposes
          const base64String = reader.result.split(',')[1];
  
          // define which folder to upload to in S3
          const folder = '/systemadmin'
          // define and trim file name
          let name = file.name;
          name = name.replace(/[^A-Za-z0-9.-]/g, ''); // Remove special characters from the file name
          // get file type
          const filetype = file.type;
          
          axios.post('https://46heb0y4ri.execute-api.us-east-1.amazonaws.com/dev/api/s3/uploadfile', { file: base64String, name: name, folderName: folder, type: filetype })
            .then((uploadFileRes) => {
              // get the URI returned by successful upload
              const uri = uploadFileRes.data.imageURL
              
              // Upload into school table
              axios.post('https://lagj9paot7.execute-api.ap-southeast-1.amazonaws.com/dev/api/sysadm-createschoolwithimage', { 
                si: schoolId,
                sn: schoolName,
                a: address,
                cn: contactNo,
                t: type,
                uri: uri,
              })
              .then(uploadSchoolRes => {
                if (uploadSchoolRes.data.success) {
                  // School successfully created
                  alert('School successfully created')
                  handleClearForm();
                  window.location.reload();
                } else {
                  alert(uploadSchoolRes.errlog);
                }
              })
              .catch(err=>{
                console.error(err)
              })
            })
            .catch((err) => {
                alert(err)
            })
        }
        reader.readAsDataURL(file);

      }

    } catch(err) {
      console.error(err)
    }
  }
  // CREATE FUNCTION END //


  //  DELETE FUNCTION START //
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deletingSchoolId, setDeletingSchoolId] = useState('');  

  const showDeleteConfirmation = (schoolid) => {
    setDeleteModalVisible(true);
    setDeletingSchoolId(schoolid);
  };

  const handleDeleteSchool = async () => {
    try {
      const res = await axios.delete('https://lagj9paot7.execute-api.ap-southeast-1.amazonaws.com/dev/api/sysadm-deleteschool', { data: { deletingSchoolId } });

      const apiResult = res.data;
      if (apiResult.success) {
        // School successfully deleted
        alert('School successfully deleted');
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

  // Hook for search
  const [searchQuery, setSearchQuery] = useState('');

  // Hooks for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;  // number of rows to display
  const startIndex = (currentPage - 1) * rowsPerPage;

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <p 
          className="font-bold text-lg"
          style={{ fontSize: '20px', color: '#56844B'}} >
          School Account Management
        </p>

          {/* Create school button */}
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
          Create School
        </CButton>

        {/* Create school modal */}
        <CModal scrollable visible={visible} onClose={() => setVisible(false)}>
          <CModalHeader>
            <CModalTitle style={{ color: '#56844B', fontWeight: 'bold', fontSize: '20px'}}>Create School</CModalTitle>
          </CModalHeader>
          <CModalBody>
            <CForm className='overflow-auto'>

              <CFormLabel>School ID</CFormLabel>
              <CFormInput 
                value={schoolId}
                onChange={(e) => setSchoolId(e.target.value)}
                className='mb-2'
              />
              <CFormLabel>School Name</CFormLabel>
              <CFormInput 
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
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
                value={contactNo}
                onChange={(e) => setContactNo(e.target.value)}
                className='mb-2'
              />
              <CFormLabel>School Type</CFormLabel>
              <CFormInput 
                value={type}
                onChange={(e) => setType(e.target.value)}
                className='mb-2'
              />
              <CFormLabel>School Picture (optional)</CFormLabel>
              <CFormInput 
                type="file"
                accept="image/jpeg, image/png"
                className='mb-2'
                onChange={handleFile} 
              />
            </CForm>
          </CModalBody>
          <CModalFooter className="d-flex justify-content-center">
            <CButton 
              style ={{'background': '#56844B', width: '70%'}}
              onClick={handleCreateSchool}>
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
          placeholder="Search school ID"
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
                .filter((row) => row.school_ID.toLowerCase().includes(searchQuery.toLowerCase()))  // .filter for real time search query
                .slice(startIndex, startIndex + rowsPerPage)  // .slice for pagination
                .map(( data, index ) => {
                const isLast = index === data.length - 1;
                const classes = isLast ? "p-4" : "p-4 border-b border-blue-gray-50";

                return (
                  <tr key={data.school_ID}>
                    <td className={classes}>
                      <Typography variant="small" color="blue-gray" className="font-normal">
                        {data.school_ID}
                      </Typography>
                    </td>
                    <td className={classes}>
                      <Typography variant="small" color="blue-gray" className="font-normal">
                        {data.school_Name}
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
                        {data.type}
                      </Typography>
                    </td>
                    <td className={classes}>
                      <Typography as="a" variant="small" color="blue" className="font-medium" 
                        onClick={() => handleViewSchoolAdmins(data.school_ID)} >
                        View school admins
                      </Typography>
                    </td>
                    <td className={classes}>
                      <Tooltip content="Delete">
                        <IconButton variant="text" color="blue-gray" onClick={() => showDeleteConfirmation(data.school_ID)}>
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
                onConfirm={handleDeleteSchool}
                callingComponent="SchoolTable"
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