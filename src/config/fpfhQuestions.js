// Configuration for FPFH form questions
export const installationTypes = [
  'Stacked with other Nokia modules',
  'Standalone', 
  'Other'
];

export const dcPowerSources = [
  'from new DC rectifier cabinet',
  'from the existing rectifier cabinet',
  'Existing external DC PDU #1',
  'Existing external DC PDU #2'
];

export const dcDistributions = ['BLVD', 'LLVD', 'PDU'];

export const fpfhQuestions = [
  {
    key: 'installationType',
    label: 'New FPFH installation type',
    type: 'select',
    options: installationTypes,
    required: true
  },
  {
    key: 'proposedLocation',
    label: 'Proposed location of the new FPFH',
    type: 'radio',
    options: ['On ground', 'On tower'],
    required: true
  },
  {
    key: 'baseHeight',
    label: 'If on tower, new FPFH base height from tower base level (meter)',
    type: 'number',
    placeholder: '00',
    condition: (entity) => entity.proposedLocation === 'On tower',
    showCondition: (entity) => entity.proposedLocation === 'On tower',
    isConditional: true
  },
  {
    key: 'towerLeg',
    label: 'If on tower, new FPFH will be located at tower leg',
    type: 'radio',
    options: ['A', 'B', 'C', 'D'],
    condition: (entity) => entity.proposedLocation === 'On tower',
    showCondition: (entity) => entity.proposedLocation === 'On tower',
    isConditional: true
  },
  {
    key: 'dcPowerSource',
    label: 'FPFH DC power coming from',
    type: 'radio',
    options: dcPowerSources,
    required: true
  },
  {
    key: 'dcDistribution',
    label: 'If directly from the existing rectifier cabinet, from which DC distribution inside the rectifier cabinet?',
    type: 'radio',
    options: dcDistributions,
    condition: (entity) => entity.dcPowerSource === 'from the existing rectifier cabinet',
    showCondition: (entity) => entity.dcPowerSource === 'from the existing rectifier cabinet',
    isConditional: true
  },
  {
    key: 'ethernetLength',
    label: 'Length of Ethernet cable between the new FPFH & base band (meter)',
    type: 'number',
    placeholder: '00',
    required: true
  },
  {
    key: 'dcCableLength',
    label: 'Length of DC power cable from the rectifier to the new FPFH (meter)',
    type: 'number',
    placeholder: '00',
    required: true
  },
  {
    key: 'earthBusExists',
    label: 'Earth bus bar exist within max 10m below the antenna & has free holes?',
    type: 'radio',
    options: ['Yes', 'No'],
    required: true
  },
  {
    key: 'earthCableLength',
    label: 'If yes, what is the length of the earth cable from the proposed FPFH location to the earth bus bar? (m)',
    type: 'number',
    placeholder: '00',
    disabledPlaceholder: 'N/A',
    condition: (entity) => entity.earthBusExists === 'Yes',
    showCondition: (entity) => entity.earthBusExists === 'Yes',
    isConditional: true
  }
]; 