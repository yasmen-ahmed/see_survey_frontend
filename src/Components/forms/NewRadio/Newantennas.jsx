import React from 'react';
import { useParams } from 'react-router-dom';
import DynamicFormTable from '../../common/DynamicFormTable';
import { useAntennaForm } from '../../../hooks/useAntennaForm';
import { antennaQuestions } from '../../../config/antennaQuestions';

const NewAntennaForm = () => {
  const { sessionId } = useParams();
  const {
    antennaCount,
    antennaForms,
    errors,
    isSubmitting,
    handleChange,
    handleSubmit,
  } = useAntennaForm(sessionId);

  return (
    <DynamicFormTable
      title=""
      entityName="Antenna"
      entityCount={antennaCount}
      entities={antennaForms}
      questions={antennaQuestions}
      errors={errors}
      onChange={handleChange}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      maxHeight="600px"
      submitButtonText="Save and Continue"
    />
  );
};

export default NewAntennaForm;
