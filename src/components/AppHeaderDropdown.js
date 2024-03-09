import React from 'react'
import {
  CAvatar,
  CDropdown,
  CDropdownDivider,
  CDropdownHeader,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
} from '@coreui/react'
import {
  cilPenAlt,
  cilAccountLogout,
} from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import Avatar from '../assets/images/defaultavatar.png'
import { useNavigate } from 'react-router-dom';

const AppHeaderDropdown = () => {
  const navigate = useNavigate();
  const redirectToProfile = (userid,usertype) => {
    // post userid to url
    // redirect to editprofile page
    navigate(`/editprofile?id=${userid}&type=${usertype}`)
  }
  const handleSignOut = () => {
    // clear local storage
    // redirect back to login page
    localStorage.clear(); 
    navigate('/')
  };

  const profileimage = localStorage.getItem('image');

  return (
    <CDropdown variant="nav-item">
      <CDropdownToggle placement="bottom-end" className="py-0" caret={false}>
        <CAvatar status="success" size="">
          <img 
            src={(profileimage == 'null') ? Avatar : profileimage}
            style={{height: '100%', width: '100%', borderRadius: '50px'}}>
          </img>
        </CAvatar>
      </CDropdownToggle>
      <CDropdownMenu className="pt-0" placement="bottom-end">
        <CDropdownHeader className="bg-light fw-semibold py-2">Account</CDropdownHeader>
          <CDropdownItem onClick={() => redirectToProfile(localStorage.getItem('userid'), localStorage.getItem('usertype'))}>
            <CIcon icon={cilPenAlt} className="me-2" />
            Edit Profile
          </CDropdownItem>
          <CDropdownDivider />
          <CDropdownItem onClick={handleSignOut}>
            <CIcon icon={cilAccountLogout} className="me-2" />
            Sign out
          </CDropdownItem>
      </CDropdownMenu>
    </CDropdown>
  )
}

export default AppHeaderDropdown