export const mwQuestions = [
  {
    id: 'siteDirection',
    label: 'Site direction',
    type: 'text',
    placeholder: 'site ID/name of faced site',
    required: true
  },
  {
    id: 'mwOduType',
    label: 'MW ODU type',
    type: 'select',
    options: ['UBT-T', 'UBT-S', 'UBT-M', 'UBT-XR', 'Other'],
    allowOther: true,
    required: true,
    condition: (entity) => entity.mwOduType === 'Other'
  },
  // {
  //   id: 'mwOduTypeOther',
  //   label: 'Specify Other MW ODU type',
  //   type: 'text',
  //   required: true,
  //   condition: (entity) => entity.mwOduType === 'Other',
  //   placeholder: 'Enter MW ODU type'
  // },
  {
    id: 'mwOduDiameter',
    label: 'MW ODU diameter',
    type: 'select',
    options: ['0.3', '0.6', '0.9', '1.2', '1.8'],
    required: true
  },
  {
    id: 'mwOduHeight',
    label: 'MW ODU height',
    type: 'number',
    placeholder: '00',
    required: true
  },
  {
    id: 'mwOduAzimuth',
    label: 'MW ODU Azimuth, angle shift from zero north direction (degree) (LOS direction)',
    type: 'number',
    placeholder: '0000',
    min: 0,
    max: 360,
    required: true
  },
  {
    id: 'mwOduRequiredMount',
    label: 'MW ODU required Mount',
    type: 'radio',
    options: ['0', '1', '2'],
    required: true
  },
  {
    id: 'mwOduPowerCableLength',
    label: 'MW ODU Power cable length (if not POE)',
    type: 'number',
    placeholder: '00',
    required: true
  },
  {
    id: 'mwOduPowerSource',
    label: 'MW ODU Power cable Source (if not POE)',
    type: 'select',
    options: ['INU', 'BLVD', 'LLVD', 'PDU'],
    required: true
  },
  {
    id: 'mwOduFiberLength',
    label: 'MW ODU fiber/Ethernet cable length',
    type: 'number',
    placeholder: '00',
    required: true
  },
  {
    id: 'mwOduTowerLeg',
    label: 'MW ODU will be located at tower leg',
    type: 'radio',
    options: ['A', 'B', 'C', 'D'],
    required: true
  },
  {
    id: 'iduMwUnitType',
    label: 'IDU MW unit type',
    type: 'select',
    options: ['MSS-E', 'MSS-HE', 'MSS-XE', 'MSS-4', 'MSS-8'],
    required: true
  },
  {
    id: 'iduMwPowerCableLength',
    label: 'IDU MW Power cable length',
    type: 'number',
    placeholder: '00',
    required: true
  },
  {
    id: 'iduProposedLocation',
    label: 'IDU proposed location',
    type: 'text',
    required: true
  }
]; 