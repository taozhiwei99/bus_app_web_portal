import { React, useState, useEffect } from 'react'
import axios from 'axios'
import {
  Card,
  CardBody,
  Typography,
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

export default function SchoolVendorAssignment() {
  // VIEW FUNCTION START //
  const TABLE_HEAD = ["VENDOR ID", "SCHOOL ID"]
  const [schoolVendorTable, setSchoolVendorTable] = useState([])
  useEffect(() => {
    axios.get('https://lagj9paot7.execute-api.ap-southeast-1.amazonaws.com/dev/api/sysadm-getschoolvendorassignment')
    .then(getRes=> {
      if (getRes.data.success) {
        setSchoolVendorTable(getRes.data.r)
      } else {
        console.error(getRes.data.message)
      }
    })
  }, [])
  // VIEW FUNCTION END //
  
  // ASSIGN FUNCTION START //
  const [assignModalVisible, setAssignModalVisble] = useState(false)
  const [vendorTable, setVendorTable] = useState([])
  const [schoolTable, setSchoolTable] = useState([])
  const [selectedVendorId, setSelectedVendorId] = useState('')
  const [selectedSchoolId, setSelectedSchoolId] = useState('')

  // Get all vendors
  useEffect(() => {
    axios.get('https://lagj9paot7.execute-api.ap-southeast-1.amazonaws.com/dev/api/sysadm-getvendor')
    .then(res => {
      setVendorTable(res.data)
    })
    .catch(err => {
      console.error(err);
    })
  }, [])

  // Get all schools
  useEffect(() => {
    axios.get('https://lagj9paot7.execute-api.ap-southeast-1.amazonaws.com/dev/api/sysadm-getschool')
    .then(res => {
      setSchoolTable(res.data)
    })
    .catch(err => {
      console.error(err);
    })
  }, [])

  const handleSchoolVendorAssignment = () => {
    if (selectedVendorId == "" || selectedSchoolId == "") {
      alert('Select a Vendor or School first')
    } else {
      axios.post('https://lagj9paot7.execute-api.ap-southeast-1.amazonaws.com/dev/api/sysadm-assignschoolvendor', {
        svi: selectedVendorId,
        ssi: selectedSchoolId
      })
      .then(assignRes => {
        if (assignRes.data.success) {
          alert(assignRes.data.message)
          window.location.reload()
        } else {
          alert(assignRes.data.message)
        }
      })
      .catch(err => {
        console.error(err)
      })
    }
  }
  // ASSIGN FUNCTION END //

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <p 
          className="font-bold text-lg"
          style={{ fontSize: '20px', color: '#56844B' }} >
          School Vendor Assignments
        </p>

        {/* Assign School-Vendor button */}
        <CButton 
          onClick={()=>setAssignModalVisble(!assignModalVisible)}
          style={{  
            '--cui-btn-color': 'white',
            '--cui-btn-bg': '#56844B',
            '--cui-btn-border-color': 'transparent',
            '--cui-btn-hover-bg': '#56844B',
            '--cui-btn-hover-border-color': '#56844B',
          }}
          className="px-2 py-2" >
          Assign School to Vendor
        </CButton>

        {/* Assign School Vendor modal */}
        <CModal 
          scrollable 
          visible={assignModalVisible} 
          onClose={() => setAssignModalVisble(false)} 
          style={{marginTop: '40%', marginLeft: '14%'}}>
          <CModalHeader>
            <CModalTitle style={{ color: '#56844B', fontWeight: 'bold', fontSize: '20px'}}>Assign School to Vendor</CModalTitle>
          </CModalHeader>
          <CModalBody>
            <CForm className='overflow-auto'>
              <CFormSelect className='pt-2' onChange={(e) => setSelectedVendorId(e.target.value)}>
                <option value="">Select a Vendor</option>
                {vendorTable.map((v) => (
                <option key={v.vendor_ID} value={v.vendor_ID}>
                  ID: {v.vendor_ID} | Name: {v.vendor_Name}
                </option>
                ))}
              </CFormSelect>
              <div className='pt-4'>
                <CFormSelect onChange={(e) => setSelectedSchoolId(e.target.value)}>
                  <option value="">Select a School</option>
                  {schoolTable.map((s) => (
                  <option key={s.school_ID} value={s.school_ID}>
                  ID: {s.school_ID} | {s.school_Name}
                  </option>
                  ))}
                </CFormSelect>
              </div>
            </CForm>
          </CModalBody>
          <CModalFooter>
            <Typography>Don't see the Vendor or School here? Register them in the site first</Typography>
            <div className="d-grid gap-2 col-6 mx-auto">
            <CButton
              style ={{'background': '#56844B'}}
              onClick={handleSchoolVendorAssignment}>
              Confirm 
            </CButton>
            </div>
          </CModalFooter>
        </CModal>
      </div>

      {/* School Vendor assignment table */}
      <Card className="overflow-scroll h-full w-full">
        <CardBody style={{ padding: 0 }}>
          {schoolVendorTable.length === 0 ? (
            <Typography className="p-4">No school vendor assignments</Typography>
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
                {schoolVendorTable
                  .map(( data, index ) => {
                  const isLast = index === data.length - 1;
                  const classes = isLast ? "p-4" : "p-4 border-b border-blue-gray-50";
                  return (
                    <tr key={data.vendor_ID}>
                      <td className={classes}>
                        <Typography variant="small" color="blue-gray" className="font-normal">
                          {data.vendor_ID}
                        </Typography>
                      </td>
                      <td className={classes}>
                        <Typography variant="small" color="blue-gray" className="font-normal">
                          {data.school_IDs}
                        </Typography>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </CardBody>
      </Card>
    </>
  )
}