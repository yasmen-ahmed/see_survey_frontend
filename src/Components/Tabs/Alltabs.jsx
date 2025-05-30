import React from "react";
const SiteLocationForm = React.lazy(() => import("../forms/siteinfo/SiteLocationform.jsx"));
const SiteVisitInfoForm = React.lazy(() => import("../forms/siteinfo/Site-vistinfoForm.jsx"));
const SiteInformationForm = React.lazy(() => import("../forms/siteinfo/SiteInformation.jsx"));
const SiteAccess=React.lazy(()=>import("../forms/siteinfo/SiteAccessForm.jsx"));
const AcInformationForm=React.lazy(()=>import("../forms/Ac-power/AcConnectionInfo.jsx"))
const PowerForm = React.lazy(() =>import("../forms/Ac-power/PowerMeterForm.jsx"))
const Acpanel= React.lazy(()=>import("../forms/Ac-power/AC-Panels.jsx"))
const RoomInfo=React.lazy(()=>import("../forms/Room/Roominfo.jsx"))
const RoomPrepForm = React.lazy(() =>import("../forms/Room/RoomPreparationForm.jsx"))
const Ran=React.lazy(()=>import("../forms/Room/RanFrom.jsx"))
const Transmission=React.lazy(()=>import("../forms/Room/TransmissionForm.jsx"))
const Dc=React.lazy(()=>import("../forms/Room/DCsystemform.jsx"))
const NewAntenna=React.lazy(()=>import("../forms/NewRadio/Newantennas.jsx"))
const AntennaStructure=React.lazy(()=>import("../forms/ExistingRadioForm/AntennaStructureinfo.jsx"))
const MwAntennas=React.lazy(()=>import("../forms/ExistingRadioForm/MWAntennas.jsx"))
const DcDistribution=React.lazy(()=>import("../forms/ExistingRadioForm/DcpduForm.jsx"))
const RadioAntennas=React.lazy(()=>import("../forms/ExistingRadioForm/RadioAntenasForm.jsx"))
const RadioUNIT=React.lazy(()=>import("../forms/ExistingRadioForm/RadioUnits.jsx"))
const new_FPFH=React.lazy(()=>import("../forms/NewRadio/NewFPFHs.jsx"))
const layout=React.lazy(()=>import("../forms/Outdoor/Outdoorgenerallayoutinfo.jsx"))
const newradio=React.lazy(()=>import("../forms/NewRadio/Radiounits.jsx"))
const existingoutdoor=React.lazy(()=>import("../forms/Outdoor/Existingoutdoorcabinets.jsx"))
const ran=React.lazy(()=>import("../forms/Outdoor/RANequipment.jsx"))
const mw=React.lazy(()=>import("../forms/Outdoor/TransmissionMW.jsx"))
const dc=React.lazy(()=>import("../forms/Outdoor/DCpowersystem.jsx"))
const hs=React.lazy(()=>import("../forms/H&S/health&safetysiteaccess.jsx"))
const bts=React.lazy(()=>import("../forms/H&S/Health&safetyBTSAntennaaccess.jsx"))
const gps=React.lazy(()=>import("../forms/NewRadio/gps.jsx"))
const radioinstallation=React.lazy(()=>import("../forms/NewRadio/Newradioinstallations.jsx"))


const newLocal = "h-s";
//const MwAntennas=React.lazy(()=>import())
export const tabsConfig ={
  "site-info": [
    { label: "Site Location", key: "site-location", component: SiteLocationForm },
    { label: "Site Visit Info", key: "site-visit", component: SiteVisitInfoForm },
    { label: "Site Information", key: "site-information", component: SiteInformationForm },
    { label: "Site Access", key:"site-access", component:SiteAccess}
  ],
  "ac-power": [
    { label: "AC connection Info", key: "ac-info", component: AcInformationForm },
    {label:"Power Meter",key:"power-meter",component:PowerForm},
    {label:"Ac-Panel",key:"ac-panel",component:Acpanel}
  ],
  "room":[
    {label:"Shelter or Telecom Room Info",key:"room-info",component:RoomInfo},
    {label:"Shelter or Telecom Room Preparation",key:"room-prep",component:RoomPrepForm},
    {label:"RAN",key:"ran",component:Ran},
    {label:"Transmission/MW",key:"tm",component:Transmission},
    {label:"Dc Power System",key:"dc",component:Dc}

  ],
  "new-radio":[
     {label:"New antennas",key:"new-antennas",component:NewAntenna},
     {label:"New FPFHs",key:"new-fphs",component:new_FPFH},
     {label:"New radio units",key:"new-radio-units",component:newradio},
     {label:"GPS",key:"gps",component:gps},
     {label:"New radio installations",key:"radio-installation",component:radioinstallation}



  ],
  "existing-radio":[
    {label:"Antenna Structure Form",key:"antennas-strut",component:AntennaStructure},
    {label:"MW Antenna",key:"mw-antennas",component:MwAntennas},
    {label:"External DC,PDU (DC panels,FPFH,…,)",key:"dc-pdu",component:DcDistribution},
    {label:"Radio Antennas",key:"radio-antenaas",component:RadioAntennas},
    {label:"Radio Units",key:"radio-units",component:RadioUNIT}


  ],
 "outdoor": [
    {label:"Outdoor general layout info", key:"general-lyout", component:layout},
    {label:"Existing outdoor cabinets", key:"exisitng-outdoor", component:existingoutdoor},
    {label:"RAN equipment", key:"ran", component:ran},
    {label:"Transmission / MW (O)", key:"mw", component:mw},
    {label:"DC power system (O)", key:"dc", component:dc}
],
"H&S": [
    {label:"Health & Safety site access", key:"h&s", component:hs},
    {label:"Health & Safety BTS / Antenna access", key:"bts", component:bts}
    
]


};
