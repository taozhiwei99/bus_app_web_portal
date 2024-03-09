import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router';
import axios from 'axios';
import { 
  Card, 
  CardHeader,
  CardBody,
  Typography,
  Tabs,
  TabPanel,
  Input,
  Button,
} from "@material-tailwind/react";
import { CModal, CModalHeader, CModalTitle, CModalBody, CForm, CFormInput, CModalFooter, CButton, } from '@coreui/react';
import Avatar from '../assets/images/defaultavatar.png'
import '../css/defaultstyle.css'
import '../scss/defaultstyle.scss'

export default function EditProfile() {
  // RETRIEVE DETAILS START //
  // Retrieve user id and type from URL parameters
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const id = searchParams.get('id');
  const type = searchParams.get('type');

  // Declare state for the details we would be receiving
  const [ profileDetails, setProfileDetails ] = useState({
    id: '',
    vendor_Name: '',
    address: '',
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  });

  useEffect(() => {
    axios.post('https://lagj9paot7.execute-api.ap-southeast-1.amazonaws.com/dev/api/webgetprofiledetails', {
      type, id
    })
      .then(res => {
        setProfileDetails(res.data);
      })
      .catch(err => {
        console.error(err);
      })
  }, [])
  // RETRIEVE DETAILS END //


  // EDIT DETAILS START //
  // Edit profile picture //
  const [editModalVisible, setEditModalVisible] = useState(false)
  const [file, setFile] = useState(null);
  const handleFile = (e) => {
      setFile(e.target.files[0]);
  }
  const handleUpload = () => {
    const usertype = localStorage.getItem('usertype')
    const maxFileSize = 10 * 1024 * 1024; 
    if (file != null) {
      if (file.size > maxFileSize) {
        alert("File size exceeds the limit of 10 MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        // Convert pdf file into base64 string for upload purposes
        const base64String = reader.result.split(',')[1];
        
        let folder;
        // Define which folder to upload to in S3
        if (usertype == 'sys-adm') {
          folder = '/systemadmin'
        } else if (usertype == 'sch-adm') {
          folder = '/schooladmin'
        } else if (usertype == 'ven') {
          folder = '/vendor'
        } else {
          alert('Upload error')
          return
        }

        // Define and trim file name
        let name = file.name;
        name = name.replace(/[^A-Za-z0-9.-]/g, ''); // Remove special characters from the file name
        // Get file type
        const type = file.type;
        
        axios.post('https://46heb0y4ri.execute-api.us-east-1.amazonaws.com/dev/api/s3/uploadfile', { file: base64String, name: name, folderName: folder, type: type })
          .then((uploadFileRes) => {
            // After successful upload, insert URI into their account
            // get the URI returned by successful upload
            // get userid and usertype
            const uri = uploadFileRes.data.imageURL
            const userid = localStorage.getItem('userid')
            
            axios.put('https://lagj9paot7.execute-api.ap-southeast-1.amazonaws.com/dev/api/web-uploadprofilepicture', { 
              uri: uri, ui: userid, ut: usertype 
            })
            .then((res) => {
              // Update localstorage image value
              localStorage.setItem('image', res.data.uri)
              alert('Profile picture changed successfully')
              window.location.reload()
            })
            .catch((err) => {
              alert(err);
            });
          })
          .catch((err) => {
              alert(err)
          })
      }
      reader.readAsDataURL(file);

    } else {
      alert("Upload a profile picture first")
    }
  }

  // State for Toggling editing mode
  const [ disableEdit, setDisableEdit ] = useState(true)
  const toggleEditMode = () => {
    if (type == "ven") {
      // We do not want vendor to change their official details randomly
      alert("Please contact Marsupium admin to change vendor details")  
      return
    } else {
      setDisableEdit(!disableEdit)
    }
  }

  // States for Edit profile details
  const [ editedFirstName, setEditedFirstName ] = useState('');
  const [ editedLastName, setEditedLastName ] = useState('');
  const [ editedEmail, setEditedEmail ] = useState('');

  // The entire point of this useEffect is to make the form show the previous value when the 'edit details' button is clicked, otherwise it would be empty since we declared it as empty ''
  useEffect(() => {
    setEditedFirstName(profileDetails.firstName);
    setEditedLastName(profileDetails.lastName);
    setEditedEmail(profileDetails.email);
  }, [profileDetails]);

  // Handle edits made by user
  const handleEdit = async () => {
    // Front end validation, check if input fields are different first
    if (editedFirstName == profileDetails.firstName && editedLastName == profileDetails.lastName && editedEmail == profileDetails.email ) {
      alert('No changes made')
      return
    } else {
      axios.put('https://lagj9paot7.execute-api.ap-southeast-1.amazonaws.com/dev/api/webeditprofiledetails', { 
        type, 
        id: profileDetails.id, 
        editedFirstName, 
        editedLastName, 
        editedEmail, 
      })
      .then(res => {
        alert('Profile successfully updated')
        // 
        setDisableEdit(!disableEdit)
        window.location.reload();
      })
      .catch(err => {
        console.error(err);
      })
    }
  }

  // States for Change password
  const [ oldPassword, setOldPassword ] = useState('');
  const [ newPassword, setNewPassword ] = useState('');
  const [ newReEnterPassword, setNewReEnterPassword ] = useState('');

  // Clear password inputs
  const clearPasswordFields = () => {
    setOldPassword('');
    setNewPassword('');
    setNewReEnterPassword('');
  }

  const handleChangePassword = async () => {
    // Validation 1, check if user entered correct old pw
    if (oldPassword !== profileDetails.password) {
      alert('Wrong password')
      window.location.reload();
      return;
    } 
    // Validation 2, check if new password typed correct
    if (newPassword !== newReEnterPassword) {
      alert('You did not type your new password correctly')
      window.location.reload();
      return;
    } 

    axios.put('https://lagj9paot7.execute-api.ap-southeast-1.amazonaws.com/dev/api/webchangepassword', {
     type,
     id: profileDetails.id,
     pw: newPassword, 
    })
    .then(res => {
      alert('Password updated successfully')
      clearPasswordFields();
      window.location.reload();
    })
    .catch(err => {
      console.error(err)
    })

  }
  // EDIT DETAILS END //

  const profileimage = localStorage.getItem('image');

  return (
    <>
      <Card className="w-full max-w-[24rem]">
        <CardHeader 
          style={{ backgroundColor: '#66925B'}} 
          color="gray" 
          floated={false} 
          shadow={false} 
          className="m-0 grid place-items-center rounded-b-none py-8 px-4 text-center">
          <div style={{width: '200px', height: '200px'}}>
            <img 
              src={(profileimage == 'null') ? Avatar : profileimage} 
              style={{height: "100%", borderRadius: '200px'}} />
          </div>

          {/* Edit profile picture button */}
          <Button 
            className="bg-color-transparent pt-4" 
            onClick={() => setEditModalVisible(!editModalVisible)}>
              Edit profile picture
          </Button>

          {/* Edit profile picture modal */}
          <CModal 
            alignment=''
            visible={editModalVisible} 
            onClose={() => setEditModalVisible(false)}>
          <CModalHeader>
            <CModalTitle style={{color: '#56844B', fontWeight: 'bold', fontSize: '20px'}}>Upload profile picture</CModalTitle>
          </CModalHeader>
          <CModalBody>
            <Typography className='pb-4'>
              Please select a picture lesser than 5mb
            </Typography>
            <CForm className='overflow-auto pb-4'>
              <CFormInput 
                type='file' 
                accept="image/jpeg, image/png"
                onChange={handleFile}/>
            </CForm>
          </CModalBody>
          <CModalFooter className="d-flex justify-content-center">
            <CButton 
              style ={{'background': '#56844B', width: '70%'}}
              onClick={handleUpload}
            >
              Save changes  
            </CButton>
          </CModalFooter>
          </CModal>

        </CardHeader>
        <CardBody>
          <Tabs value="card" className="overflow-visible">
            <TabPanel value="card" className="p-0">
              <div>
                <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
                  User ID
                </Typography>
                <Input disabled value={profileDetails.id}/>
              </div>
              {type == "ven" ? (
                  // Vendor's interface will show vendor name and address
                  <>
                    <div>
                      <Typography variant="small" color="blue-gray" className="mt-4 mb-2 font-medium">
                        Vendor Name
                      </Typography>
                      <Input disabled={disableEdit} value={profileDetails.vendor_Name} />
                    </div>
                    <div>
                      <Typography variant="small" color="blue-gray" className="mt-4 mb-2 font-medium">
                        Address
                      </Typography>
                      <Input disabled={disableEdit} value={profileDetails.address}/>
                    </div>
                  </>
                ) : (
                  // System or School admin's interface will show first last name 
                  <>
                    <div>
                      <Typography variant="small" color="blue-gray" className="mt-4 mb-2 font-medium">
                        First Name
                      </Typography>
                      <Input 
                        disabled={disableEdit} 
                        value={
                          disableEdit ? profileDetails.firstName : editedFirstName
                        }
                        onChange={(e) => setEditedFirstName(e.target.value)} />
                    </div>
                    <div>
                      <Typography variant="small" color="blue-gray" className="mt-4 mb-2 font-medium">
                        Last Name
                      </Typography>
                      <Input 
                        disabled={disableEdit} 
                        value={
                          disableEdit ? profileDetails.lastName : editedLastName
                        }
                        onChange={(e) => setEditedLastName(e.target.value)} />
                    </div>
                  </>
                )
              }
              <div>
                <Typography variant="small" color="blue-gray" className=" mt-4 mb-2 font-medium">
                  Email
                </Typography>
                <Input 
                  disabled={disableEdit} 
                  value={
                    disableEdit ? profileDetails.email : editedEmail
                  }
                  onChange={(e) => setEditedEmail(e.target.value)}
                  />
              </div>
              <div className="flex justify-between">
                <Button className="mt-4" style={{ 'width': '40%', 'backgroundColor': '#56844B' }} size="lg" onClick={toggleEditMode}>
                  {disableEdit ? 'Edit details': 'Cancel'}
                </Button>
                <Button className="mt-4" style={{ 'width': '40%', 'backgroundColor': '#56844B' }} size="lg" disabled={disableEdit} onClick={handleEdit}>Save changes</Button>
              </div>
            </TabPanel>
          </Tabs>
        </CardBody>
      </Card>

      <Card className="w-full max-w-[24rem] mt-5">
        <CardHeader 
          style={{ backgroundColor: '#66925B'}} 
          color="gray" floated={false} 
          shadow={false} 
          className="m-0 grid place-items-center rounded-b-none py-8 px-4 text-center" value="cardheader">
          <Typography variant="h6" color="white">
            Change Password
          </Typography>
        </CardHeader>
        <CardBody>
          <Tabs value="card" className="overflow-visible">
            <TabPanel value="card" className="p-0">
              <div>
                <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
                    Old password
                </Typography>
                <Input 
                  type='password'
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}/>
              </div>
              <div>
                <Typography variant="small" color="blue-gray" className="mt-4 mb-2 font-medium">
                    New password
                </Typography>
                <Input 
                  type='password'
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}/>
              </div>
              <div>
                <Typography variant="small" color="blue-gray" className="mt-4 mb-2 font-medium">
                    Re-enter new password
                </Typography>
                <Input 
                  type='password'
                  value={newReEnterPassword}
                  onChange={(e) => setNewReEnterPassword(e.target.value)}/>
              </div>
              <div className="flex justify-between">
                <Button className="mt-4" style={{ 'width': '30%', 'backgroundColor': '#56844B' }} size="lg" onClick={handleChangePassword}>Change password</Button>
              </div>
            </TabPanel>
          </Tabs>
        </CardBody>
      </Card>
    </>
  )
}