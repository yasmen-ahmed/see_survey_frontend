// Configuration for antenna form questions
export const technologies = ['2G', '3G', '4G', '5G'];
export const sideArmOptions = [
  'Use existing empty side arm',
  'Use swapped antenna side arm',
  'New side arm need to be supplied'
];

export const antennaQuestions = [
  {
    key: 'sectorNumber',
    label: 'Sector Number',
    type: 'select',
    options: [1, 2, 3, 4, 5, 6],
    required: true
  },
  {
    key: 'newOrSwap',
    label: 'New or swap?',
    type: 'radio',
    options: ['New', 'Swap'],
    required: true
  },
  {
    key: 'technologies',
    label: 'New antenna technology',
    type: 'checkbox',
    options: technologies,
    required: true
  },
  {
    key: 'azimuth',
    label: 'Azimuth, angle shift from zero north direction (degree)',
    type: 'number',
    placeholder: '0000'
  },
  {
    key: 'baseHeight',
    label: 'New antenna base height from tower base level (meter)',
    type: 'number',
    placeholder: '000',
    required: true
  },
  {
    key: 'towerLeg',
    label: 'New antenna will be located at tower leg',
    type: 'radio',
    options: ['A', 'B', 'C', 'D'],
    required: true
  },
  {
    key: 'towerSection',
    label: 'Tower leg section at the new antenna proposed location',
    type: 'radio',
    options: ['Angular', 'Tubular']
  },
  {
    key: 'angularL1Dimension',
    label: 'If Angular, what are the L1 dimensions? (mm)',
    type: 'number',
    placeholder: '000',
    disabledPlaceholder: 'N/A',
    condition: (entity) => entity.towerSection === 'Angular',
    showCondition: (entity) => entity.towerSection === 'Angular',
    isConditional: true
  },
  {
    key: 'angularL2Dimension',
    label: 'If Angular, what are the L2 dimensions? (mm)',
    type: 'number',
    placeholder: '000',
    disabledPlaceholder: 'N/A',
    condition: (entity) => entity.towerSection === 'Angular',
    showCondition: (entity) => entity.towerSection === 'Angular',
    isConditional: true
  },
  {
    key: 'tubularCrossSection',
    label: 'If Tubular, what are the cross section? (mm)',
    type: 'number',
    placeholder: '000',
    disabledPlaceholder: 'N/A',
    condition: (entity) => entity.towerSection === 'Tubular',
    showCondition: (entity) => entity.towerSection === 'Tubular',
    isConditional: true
  },
  {
    key: 'sideArmOption',
    label: 'New antenna side arm',
    type: 'select',
    options: sideArmOptions
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
    key: 'earthBusExists',
    label: 'Earth bus bar exist within max 10m below the antenna & has free holes?',
    type: 'radio',
    options: ['Yes', 'No']
  },
  {
    key: 'earthCableLength',
    label: 'If yes, what is the length of the earth cable from the proposed antenna location to the earth bus bar? (m)',
    type: 'number',
    placeholder: '00',
    disabledPlaceholder: 'N/A',
    condition: (entity) => entity.earthBusExists === 'Yes',
    showCondition: (entity) => entity.earthBusExists === 'Yes',
    isConditional: true
  }
]; 