import React from 'react';
import { useParams } from 'react-router-dom';
import DynamicFormTable from '../../common/DynamicFormTable';
import { useRadioUnitsForm } from '../../../hooks/useRadioUnitsForm';
import { radioUnitsQuestions } from '../../../config/radioUnitsQuestions';

const NewRadioUnitsForm = () => {
  const { sessionId } = useParams();
  const {
    radioUnitsCount,
    radioUnitsForms,
    errors,
    isLoading,
    isSubmitting,
    handleRadioUnitsCountChange,
    handleChange,
    handleSubmit,
  } = useRadioUnitsForm(sessionId);



  return (
    <DynamicFormTable
      title=""
      entityName="Radio Unit"
      entityCount={radioUnitsCount}
      entities={radioUnitsForms}
      questions={radioUnitsQuestions}
      errors={errors}
      onChange={handleChange}
      onSubmit={handleSubmit}
      onEntityCountChange={handleRadioUnitsCountChange}
      isSubmitting={isSubmitting}
      maxHeight="600px"
      submitButtonText="Save and Continue"
    />
  );
};

export default NewRadioUnitsForm;
