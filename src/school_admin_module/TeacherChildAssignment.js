import { React, useState, useEffect } from 'react'
import axios from 'axios'
import {
  Card,
  CardBody,
  Typography,
} from '@material-tailwind/react'
import {
  CButton,
  CForm,
  CFormSelect,
} from '@coreui/react'
import '../scss/defaultstyle.scss'
import '../css/defaultstyle.css'
import { useNavigate } from 'react-router-dom'

export default function TeacherChildAssignment() {
  // Retrieve teachers associated with the school for dropdown option box
  const [teacherTable, setTeacherTable] = useState([]);
  const schoolid = localStorage.getItem('schoolid') || 'defaultSchoolId';

  useEffect(() => {
    axios.get(`https://lagj9paot7.execute-api.ap-southeast-1.amazonaws.com/dev/api/schadm-getteachers/${schoolid}`)
      .then(teacherRes => {
        setTeacherTable(teacherRes.data);
      })
      .catch(error => {
        console.error(error);
      });
  }, [schoolid]);

  // VIEW FUNCTION START //
  const [teacherChildTable, setTeacherChildTable] = useState([])
  const TABLE_HEAD = ['CHILD ID', "", ""]
  const [displayTable, setDisplayTable] = useState(false)

  const [selectedTeacherId, setSelectedTeacherId] = useState('NIL')
  const handleViewTeacherChildAssignment = async () => {
    // 'Reset' states
    setTeacherChildTable([])
    setDisplayTable(false)

    try {
      if (selectedTeacherId === 'NIL') {
        alert('Select a teacher ID first');
      } else {
        const viewSelectedRes = await axios.get(`https://lagj9paot7.execute-api.ap-southeast-1.amazonaws.com/dev/api/schadm-getteacherchildassignment/${selectedTeacherId}`);
        
        if (viewSelectedRes.data.outcome === 1) {
          setTeacherChildTable(viewSelectedRes.data.r)
          setDisplayTable(true);
        } else if (viewSelectedRes.data.outcome === 2) {
          setDisplayTable(true)
        }
        
      }
    } catch (err) {
      console.error(err);
    }
  };
  // VIEW FUNCTION END //
  
  // Navigate user to upload csv of teacher child assignment
  const navigate = useNavigate();
  const redirectToUploadTeacherChild = () => {
    navigate('/school-admin/uploadteacherchildassignment');
  }

  return (
    <>
      <div className="flex flex-col items-left mt-3 mb-4">
        <div className="px-4">
          <p className="font-bold text-lg" style={{ fontSize: '20px', color: '#56844B' }}>
            View current form teacher assignments
          </p>
        </div>

        <div className="flex pt-4 ">
          <div className="p-3">
            <CForm className="overflow-auto">
              <CFormSelect className="pt-2" onChange={(e) => setSelectedTeacherId(e.target.value)}>
                <option>Select a teacher</option>
                {teacherTable.map((t) => (
                  <option key={t.teacher_ID} value={t.teacher_ID}>
                    ID: {t.teacher_ID} | Name: {t.firstName} {t.lastName}
                  </option>
                ))}
              </CFormSelect>
            </CForm>
          </div>

          <div className="p-3">
            <CButton
              onClick={handleViewTeacherChildAssignment}
              style={{
                '--cui-btn-color': 'white',
                '--cui-btn-bg': '#56844B',
                '--cui-btn-border-color': 'transparent',
                '--cui-btn-hover-bg': '#56844B',
                '--cui-btn-hover-border-color': '#56844B',
                '--cui-btn-disabled-bg': '#56844B',
              }}
              className="px-32"
              disabled={selectedTeacherId === 'NIL'}
            >
              View
            </CButton>
          </div>


          <div className="flex p-3">
          <Typography className="p-2">
            Yet to assign child's form teacher in our site? 
          </Typography>
          <Typography color="blue" 
            onClick={redirectToUploadTeacherChild}
            className="p-2">
            Upload now
          </Typography>
        </div>


        </div>
      </div>

      {displayTable === true && teacherChildTable.length === 0 ? (
        <Card className="flex-row w-full max-w-[48rem]" style={{ marginTop: '15px' }}>
          <CardBody>
            <Typography variant="h6" color="blue-gray" className="mb-2">
              Teacher is not a form teacher of any child currently
            </Typography>
          </CardBody>
        </Card>
        ) : null}
        
      {displayTable === true && teacherChildTable.length > 0 ? (
      <>
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
            {teacherChildTable
              .map(( data, index ) => {
              const isLast = index === data.length - 1;
              const classes = isLast ? "p-4" : "p-4 border-b border-blue-gray-50";

              return (
                <tr key={data.child_ID}>
                  <td className={classes}>
                    <Typography variant="small" color="blue-gray" className="font-normal">
                      {data.child_ID}
                    </Typography>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </>
      ) : null}
    </>
  )
}