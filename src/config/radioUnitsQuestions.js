// Configuration for radio units form questions
export const vendors = ['Nokia', 'Ericsson', 'Huawei'];
export const nokiaModels = [
  'List Nokia models to be provided by SE'
];
export const dcPowerSources = [
  'Direct from rectifier distribution',
  'New FPFH', 
  'Existing FPFH',
  'Existing DC PDU (not FPFH)'
];
export const sideArmOptions = [
  'Use existing empty side arm',
  'Use existing antenna side arm', 
  'New side arm need to be supplied'
];

export const radioUnitsQuestions = [
  {
    key: 'sector',
    label: 'New radio unit sector',
    type: 'select',
    options: [1, 2, 3, 4, 5, 6],
    required: true
  },
  {
    key: 'antennaConnection',
    label: 'Connected to new or existing antenna?',
    type: 'radio',
    options: ['New', 'Existing'],
    required: true
  },
  {
    key: 'technologies',
    label: 'Connected antenna technology',
    type: 'checkbox',
    options: ['2G', '3G', '4G', '5G'],
    required: true
  },
  {
    key: 'model',
    label: 'New radio unit model',
    type: 'select',
    options: nokiaModels,
    required: true
  },
  {
    key: 'location',
    label: 'New radio unit will be located at ..',
    type: 'radio',
    options: [
      'Tower leg A',
      'Tower leg B', 
      'Tower leg C',
      'Tower leg D',
      'On the ground'
    ],
    required: true
  },
  {
    key: 'feederLength',
    label: 'If on the ground, what is the feeder length until the antenna? (meter)',
    type: 'number',
    placeholder: '000',
    condition: (entity) => entity.location === 'On the ground',
    showCondition: (entity) => entity.location === 'On the ground',
    isConditional: true
  },
  {
    key: 'towerLegSection',
    label: 'If tower leg, what is the tower leg section at the proposed height/location of the new radio unit?',
    type: 'radio',
    options: ['Angular', 'Tubular'],
    condition: (entity) => entity.location && entity.location.includes('Tower leg'),
    showCondition: (entity) => entity.location && entity.location.includes('Tower leg'),
    isConditional: true
  },
  {
    key: 'angularDimensions',
    label: 'If Angular, what are the dimensions? (L1 x L2 in mm)',
    type: 'text',
    placeholder: '000 x 000',
    disabledPlaceholder: 'N/A',
    condition: (entity) => entity.towerLegSection === 'Angular',
    showCondition: (entity) => entity.towerLegSection === 'Angular',
    isConditional: true
  },
  {
    key: 'tubularSection',
    label: 'If Tubular, what are the cross section? (mm)',
    type: 'number',
    placeholder: '000',
    disabledPlaceholder: 'N/A',
    condition: (entity) => entity.towerLegSection === 'Tubular',
    showCondition: (entity) => entity.towerLegSection === 'Tubular',
    isConditional: true
  },
  {
    key: 'sideArmOption',
    label: 'New radio unit side arm',
    type: 'select',
    options: sideArmOptions,
    required: true
  },
  {
    key: 'sideArmLength',
    label: 'If side arm exist, specify the side arm length (meter)',
    type: 'number',
    placeholder: '000',
    isConditional: true
  },
  {
    key: 'sideArmCrossSection',
    label: 'If side arm exist, specify the side arm cross section (mm)',
    type: 'number',
    placeholder: '000',
    isConditional: true
  },
  {
    key: 'sideArmOffset',
    label: 'If side arm exist, specify the side arm offset from the tower leg profile (cm)',
    type: 'number',
    placeholder: '000',
    isConditional: true
  },
  {
    key: 'dcPowerSource',
    label: 'The DC power source to feed the new radio unit',
    type: 'radio',
    options: dcPowerSources,
    required: true
  },
  {
    key: 'dcCableLength',
    label: 'Length of the DC power cable from the new radio unit to the DC power source (meter)',
    type: 'number',
    placeholder: '00',
    required: true
  },
  {
    key: 'fiberLength',
    label: 'Length of fiber cable from the new radio unit to the base band (meter)',
    type: 'number',
    placeholder: '00',
    required: true
  },
  {
    key: 'jumperLength',
    label: 'Length of jumper between the new radio unit & the antenna (meter)',
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
    label: 'If yes, what is the length of the earth cable from the proposed radio unit location to the earth bus bar? (m)',
    type: 'number',
    placeholder: '00',
    disabledPlaceholder: 'N/A',
    condition: (entity) => entity.earthBusExists === 'Yes',
    showCondition: (entity) => entity.earthBusExists === 'Yes',
    isConditional: true
  }
]; 