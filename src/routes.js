import React from 'react'

//Common
const Login = React.lazy(() => import('./common/Login'))
const EditProfile = React.lazy(() => import('./common/EditProfile'))

//Sys admin
const DashboardSystemAdmin = React.lazy(() => import('./system_admin_module/DashboardSystemAdmin'))
const SubscriberTable = React.lazy(() => import('./system_admin_module/SubscriberTable'))
const SelfPickUpRecordsTable = React.lazy(() => import('./system_admin_module/SelfPickUpRecordsTable'))
const VehiclePickUpRecordsTable = React.lazy(() => import('./system_admin_module/VehiclePickUpRecordsTable'))
const SchoolTable = React.lazy(() => import('./system_admin_module/SchoolTable'))
const SchoolTableViewAdmins = React.lazy(() => import('./system_admin_module/SchoolTableViewAdmins'))
const VendorTable = React.lazy(() => import('./system_admin_module/VendorTable'))
const VendorTableViewDrivers = React.lazy(() => import('./system_admin_module/VendorTableViewDrivers'))
const SchoolVendorAssignment = React.lazy(() => import('./system_admin_module/SchoolVendorAssignment'))

//Sch admin
const AnnouncementTable = React.lazy(() => import('./school_admin_module/AnnouncementTable'))
const TeacherTable = React.lazy(() => import('./school_admin_module/TeacherTable'))
const ChildTable = React.lazy(() => import('./school_admin_module/ChildTable'))
const SchoolSchedule = React.lazy(() => import('./school_admin_module/SchoolSchedule'))
const UploadTeacher = React.lazy(() => import('./school_admin_module/UploadTeacher')) 
const UploadParent = React.lazy(() => import('./school_admin_module/UploadParent'))
const UploadChild = React.lazy(() => import('./school_admin_module/UploadChild')) 
const UploadGate = React.lazy(() => import('./school_admin_module/UploadGate')) 
const UploadClass = React.lazy(() => import('./school_admin_module/UploadClass')) 
const UploadSchedule = React.lazy(() => import('./school_admin_module/UploadSchedule')) 
const UploadTeacherChildAssignment = React.lazy(() => import('./school_admin_module/UploadTeacherChildAssignment')) 
const GateAssignment = React.lazy(() => import('./school_admin_module/GateAssignment'))
const TeacherChildAssignment = React.lazy(() => import('./school_admin_module/TeacherChildAssignment'))
const ParentTable = React.lazy(() => import('./school_admin_module/ParentTable'))
const GateTable = React.lazy(() => import('./school_admin_module/GateTable'))
const ClassTable = React.lazy(() => import('./school_admin_module/ClassTable'))

//Vendor
const DashboardVendor = React.lazy(() => import('./vendor_module/DashboardVendor'))
const ViewVehiclePickUpJobs = React.lazy(() => import('./vendor_module/ViewVehiclePickUpJobs'))
const DriverTable = React.lazy(() => import('./vendor_module/DriverTable'))
const VehicleTable = React.lazy(() => import('./vendor_module/VehicleTable'))
const DriverAssignment = React.lazy(() => import('./vendor_module/DriverAssignment'))
const UploadVehicle = React.lazy(() => import('./vendor_module/UploadVehicle'))
const UploadDriver = React.lazy(() => import('./vendor_module/UploadDriver'))

const routes = [
  { path: '/', exact: true, name: 'Login', element: Login },
  { path: '/editprofile', exact: true, name: 'Edit Profile', element: EditProfile },

  { path: '/system-admin/dashboard', name: 'System Admin Dashboard', element: DashboardSystemAdmin },
  { path: '/system-admin/managesubscribers', name: 'subscribertable', element: SubscriberTable },
  { path: '/system-admin/selfpickuprecords', name: 'subscribertable', element: SelfPickUpRecordsTable },
  { path: '/system-admin/vehiclepickuprecords', name: 'subscribertable', element: VehiclePickUpRecordsTable },
  { path: '/system-admin/school', name: 'SchoolTable', element: SchoolTable },
  { path: '/system-admin/school/viewadmins', name: 'SchoolTableViewAdmins', element: SchoolTableViewAdmins },
  { path: '/system-admin/vendor', name: 'VendorTable', element: VendorTable },
  { path: '/system-admin/vendor/viewdrivers', name: 'VendorTableViewDrivers', element: VendorTableViewDrivers },
  { path: '/system-admin/schoolvendorassignment', name: 'School Vendor Assignment', element: SchoolVendorAssignment },

  { path: '/school-admin/announcements', name: 'Announcements', element: AnnouncementTable },
  { path: '/school-admin/teacher', name: 'Teacher', element: TeacherTable },
  { path: '/school-admin/child', name: 'Child', element: ChildTable },
  { path: '/school-admin/schedule', name: 'Schedule', element: SchoolSchedule },
  { path: '/school-admin/uploadteacher', name: 'Upload Teacher', element: UploadTeacher },
  { path: '/school-admin/uploadparent', name: 'Upload Parent', element: UploadParent },
  { path: '/school-admin/uploadchild', name: 'Upload Child', element: UploadChild },
  { path: '/school-admin/uploadgate', name: 'Upload Gate', element: UploadGate },
  { path: '/school-admin/uploadclass', name: 'Upload Class', element: UploadClass },
  { path: '/school-admin/uploadschedule', name: 'Upload Schedule', element: UploadSchedule },
  { path: '/school-admin/gateassignment', name: 'Gate Assignment', element: GateAssignment },
  { path: '/school-admin/teacherchildassignment', name: 'Teacher Child Assignment', element: TeacherChildAssignment },
  { path: '/school-admin/uploadteacherchildassignment', name: 'Upload Teacher Child Assignment', element: UploadTeacherChildAssignment },
  { path: '/school-admin/parent', name: 'Parent', element: ParentTable },
  { path: '/school-admin/gate', name: 'Parent', element: GateTable },
  { path: '/school-admin/class', name: 'Parent', element: ClassTable },

  { path: '/vendor/dashboard', name: 'Vendor Dashboard', element: DashboardVendor },
  { path: '/vendor/dashboard/viewvehiclepickupjobs', name: 'Vendor View Vehicle Pick Up Jobs', element: ViewVehiclePickUpJobs },
  { path: '/vendor/drivers', name: 'Drivers', element: DriverTable },
  { path: '/vendor/vehicletable', name: 'Vehicle Management', element: VehicleTable },
  { path: '/vendor/driverassignment', name: 'Driver Assignment', element: DriverAssignment },
  { path: '/vendor/uploadvehicle', name: 'Upload Vehicle', element: UploadVehicle },
  { path: '/vendor/uploaddriver', name: 'Upload Driver', element: UploadDriver },
]

export default routes