import React, { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import {
  CContainer,
  CHeader,
  CHeaderBrand,
  CHeaderNav,
  CHeaderToggler,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilHamburgerMenu } from '@coreui/icons'
import { AppHeaderDropdown } from './index'
import { Typography } from '@material-tailwind/react'
import '../css/defaultstyle.css'

const AppHeader = () => {
  const dispatch = useDispatch()
  const sidebarShow = useSelector((state) => state.sidebarShow)

  const [usertype, setUserType] = useState('')
  useEffect(() => {
    let ut = localStorage.getItem('usertype')
    if (ut == 'sys-adm') {
      setUserType('System Admin')
    } else if (ut == 'sch-adm') {
      setUserType('School Admin')
    } else if (ut == 'ven') {
      setUserType('Vendor')
    } else {
      setUserType('Invalid')
    }
  }, [])
  
  return (
    <CHeader position="sticky" className="mb-4">
      <CContainer fluid>
        <CHeaderToggler
          className="ps-1" 
          onClick={() => dispatch({ type: 'set', sidebarShow: !sidebarShow })} >
          <CIcon 
            icon={cilHamburgerMenu} 
            size="lg" 
            style={{color: '#56844B'}} />
        </CHeaderToggler>
        <Typography className="d-none d-md-flex ms-auto mb-0">Logged in as {usertype}</Typography>
        <CHeaderBrand className="mx-auto d-md-none" to="/" />
        <CHeaderNav className="ms-3">
          <AppHeaderDropdown />
        </CHeaderNav>
      </CContainer>
    </CHeader>
  )
}

export default AppHeader
