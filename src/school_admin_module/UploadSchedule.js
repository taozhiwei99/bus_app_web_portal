import React from 'react'
import {
  CButton,
  CContainer,
  CFormInput,
  CFormLabel,
  CForm,
  CFormSelect,
} from '@coreui/react'
import { useState } from 'react'
import '../css/defaultstyle.css'
import axios from 'axios';

export default function UploadSchedule() {
  const [file, setFile] = useState(null);
  const handleFile = (e) => {
      setFile(e.target.files[0]);
  }

  const [scheduleDescription, setScheduleDescription] = useState('')
  const [scheduleYear, setScheduleYear] = useState('')
  
  const handleUpload = () => {
    if (file != null && scheduleDescription != "" && scheduleYear != "") {
      const reader = new FileReader();
      reader.onloadend = () => {
        // convert pdf file into base64 string for upload purposes
        const base64String = reader.result.split(',')[1];

        // define which folder to upload to in S3
        const folder = '/schooladmin'
        // define and trim file name
        let name = file.name;
        name = name.replace(/[^A-Za-z0-9.-]/g, ''); // Remove special characters from the file name
        // get file type
        const type = file.type;
        
        axios.post('https://46heb0y4ri.execute-api.us-east-1.amazonaws.com/dev/api/s3/uploadfile', { file: base64String, name: name, folderName: folder, type: type })
          .then((uploadFileRes) => {
            // After successful upload, insert URI into schedule table
            // get the URI returned by successful upload
            // get userid and schoolid of poster
            const uri = uploadFileRes.data.imageURL
            const userid = localStorage.getItem('userid')
            const schoolid = localStorage.getItem('schoolid')
            
            // Make the second POST request to upload the schedule to the database
            axios.post('https://lagj9paot7.execute-api.ap-southeast-1.amazonaws.com/dev/api/schadm-uploadschedule', { sd: scheduleDescription, sy: scheduleYear, uri: uri, userid: userid, schoolid: schoolid })
            .then((createScheduleRes) => {
              const apiresult = createScheduleRes.data;
              if (apiresult.success) {
                alert('Upload success. View in schedules page');
                window.location.reload();
              } else {
                alert(apiresult.errlog);
              }
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
      alert("Upload file, enter description and select the year first")
    }
  }

  return (
    <>
      <CContainer 
        className='px-5 py-4 pb-5' 
        style={{ display: 'flex', flexDirection: 'column'}}>
        <h1 
          style={{ color: '#56844B', fontWeight: 'bold', marginBottom: '25px', fontSize: '20px'}}>
          Upload School Schedule
        </h1>
        <CForm className='overflow-auto w-max'>
          <CFormInput 
            type="file" 
            id="formFile"
            accept=".pdf, .jpg, .png"
            onChange={handleFile}
            className=''/>

          <div className='mt-4'>
          <CFormLabel>Enter a description for your schedule</CFormLabel>
          <CFormInput 
            id="scheduleDesc"
            value={scheduleDescription}
            onChange={(e) => setScheduleDescription(e.target.value)}
            className=''/>
          </div>

          <div className='mt-4'>
          <CFormLabel>Select schedule's year</CFormLabel>
          <CFormSelect onChange={(e) => setScheduleYear(e.target.value)}>
            <option value={scheduleYear}>Year</option>
            <option value="2023">2023</option>
            <option value="2024">2024</option>
            <option value="2025">2025</option>
            <option value="2026">2026</option>
            <option value="2027">2027</option>
            <option value="2028">2028</option>
            <option value="2029">2029</option>
            <option value="2030">2030</option>
          </CFormSelect>
          </div>

          <div style={{marginTop: '40px', display: 'flex', justifyContent: 'space-between'}} className=''>
            <CButton 
              onClick={handleUpload}
              style ={{'background': '#56844B', width: '45%'}}
              >
              Submit
            </CButton>
          </div>
        </CForm>
      </CContainer>
    </>
  )
}