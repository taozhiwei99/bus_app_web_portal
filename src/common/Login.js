import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CButton,
  CCard,
  CCardBody,
  CCardGroup,
  CCol,
  CContainer,
  CForm,
  CFormInput,
  CInputGroup,
  CRow,
  CFormSelect,
} from '@coreui/react';
import BrandImage from '../assets/images/logo1.jpg';
import '../scss/login.scss'
import axios from 'axios';


export default function Login() {
  // Hooks for login form
  const [userid, setUserid] = useState('');
  const [password, setPassword] = useState('');
  const [usertype, setUsertype] = useState('sys-adm');  // Set default as 'sys-adm' because that is the first choice of the CFormSelect, and we are accounting for the situation that system admin did not touch the drop down box at all during login. If that scenario happens then default value 'sys-adm' will come into play when API request is sent
  const navigate = useNavigate(); 

  // Clear localStorage whenever the login page is rendered
  useEffect(() => {
    localStorage.clear();
  }, []);
  
  const handleLogin = async () => {
    if (!userid || !password) {
      alert('Enter all fields first')
    } else {
      try {
        const response = await axios.post('https://lagj9paot7.execute-api.ap-southeast-1.amazonaws.com/dev/api/weblogin', {
          userid: userid,
          password: password,
          usertype: usertype,
        }, {
          headers: {
            'Content-Type': 'application/json'
          }
        });
    
        if (response) {
          const data = response.data;

          if (!data.success) {
            // Inform user wrong login credentials
            alert('Wrong userid or password')
            window.location.reload();
          } else {
            // Else proceed to log user in to their dashboard
            const usertype = data.usertype;
            localStorage.setItem('usertype', usertype)
    
            switch (data.usertype) {
              case "sys-adm":
                // Retrieve relevant details from API response
                const sysadmid = data.userid;
                const sysadmfirstname = data.firstName;
                const sysadmlastname = data.lastName;
                const sysadmimageuri = data.imageURI;
                // Store relevant details
                localStorage.setItem('userid', sysadmid)
                localStorage.setItem('firstname', sysadmfirstname)
                localStorage.setItem('lastname', sysadmlastname)
                localStorage.setItem('image', sysadmimageuri)
                // Navigate
                navigate('/system-admin/dashboard');
                break;
    
              case "sch-adm":
                // Retrieve relevant details from API response
                const schadmid = data.userid;
                const schadmfirstname = data.firstName;
                const schadmlastname = data.lastName;
                const schadmschoolid = data.school_ID;
                const schadmimageuri = data.imageURI;
                // Store relevant details
                localStorage.setItem('userid', schadmid)
                localStorage.setItem('firstname', schadmfirstname)
                localStorage.setItem('lastname', schadmlastname)
                localStorage.setItem('schoolid', schadmschoolid)
                localStorage.setItem('image', schadmimageuri)
                // Navigate
                navigate('/school-admin/announcements');
                break;
    
              case "ven":
                // Retrieve relevant details from API response
                const vendorid = data.userid;
                const vendorname = data.vendor_Name;
                const vendorimageuri = data.imageURI
                // Find all the schools that are associated with the vendor (school_vendor table)
                axios.get(`https://lagj9paot7.execute-api.ap-southeast-1.amazonaws.com/dev/api/ven-getassociatedschools/${vendorid}`)
                .then (res => {
                  const venschoolids = res.data;
                  // Store relevant details
                  localStorage.setItem('userid', vendorid)
                  localStorage.setItem('vendorname', vendorname)
                  localStorage.setItem('assoc_schools', JSON.stringify(venschoolids))
                  localStorage.setItem('image', vendorimageuri)
                  // Navigate
                  navigate('/vendor/dashboard');
                })
                .catch (err => {
                  console.error(err)
                })
                break;
            }
          }
        }
      } catch (error) {
        console.error('Error:', error);
      }
    }
  }

  // Function enables user to press enter right after entering password
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleLogin();
    }
  }

  return (
    <div className="maindiv">
      <CContainer>
        <CRow className="crow">
          <CCol md={8}>
            <CCardGroup className='ccardgrp'>
              <CCard className='ccard'><img src={BrandImage} alt="_brandlogo" /></CCard>
              <CCard className='ccard'>
                <CCardBody>
                  <CForm>
                    <h1 className='h1'>Log In</h1>
                    <p>
                      Welcome to Marsupium, your best friend when it comes to picking up your child after school
                    </p> 

                    <CInputGroup className="cinputgrp">
                      <CFormSelect 
                        id="inputGroupSelect01" 
                        value={usertype} 
                        onChange={(e) => setUsertype(e.target.value)}
                      >
                        <option value='sys-adm'>Log in as System Admin</option>
                        <option value='sch-adm'>Log in as School Admin</option>
                        <option value='ven'>Log in as Vendor</option>
                      </CFormSelect>
                    </CInputGroup>

                    <CInputGroup className="cinputgrp">
                      <CFormInput
                        id="userid"
                        placeholder="User ID"
                        autoComplete="userid"
                        value={userid}
                        onChange={(e) => setUserid(e.target.value)}
                      />
                    </CInputGroup>

                    <CInputGroup className="cinputgrp">
                      <CFormInput
                        id="password"
                        type="password"
                        placeholder="Password"
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onKeyDown={handleKeyDown}
                      />
                    </CInputGroup>

                    <p className="p">Log in with the user id assigned to you by your administrator</p>
                    <CRow>
                      <CCol xs={6}>
                        <CButton
                          className='cbtn'
                          onClick={handleLogin}
                        >
                          Let's start
                        </CButton>
                      </CCol>
                    </CRow>
                  </CForm>
                </CCardBody>
              </CCard>
            </CCardGroup>
          </CCol>
        </CRow>
      </CContainer>
    </div>
  );
}