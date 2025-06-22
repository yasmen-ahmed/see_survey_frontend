import React from 'react';
import { useParams } from 'react-router-dom';
import DynamicFormTable from '../../common/DynamicFormTable';
import { useFpfhForm } from '../../../hooks/useFpfhForm';
import { fpfhQuestions } from '../../../config/fpfhQuestions';

const NewFPFHForm = () => {
  const { sessionId } = useParams();
  const {
    fpfhCount,
    fpfhForms,
    errors,
    isLoading,
    isSubmitting,
    handleFpfhCountChange,
    handleChange,
    handleSubmit,
  } = useFpfhForm(sessionId);


  return (
    <DynamicFormTable
      title=""
      entityName="FPFH"
      entityCount={fpfhCount}
      entities={fpfhForms}
      questions={fpfhQuestions}
      errors={errors}
      onChange={handleChange}
      onSubmit={handleSubmit}
      onEntityCountChange={handleFpfhCountChange}
      isSubmitting={isSubmitting}
      maxHeight="600px"
      submitButtonText="Save and Continue"
    />
  );
};

export default NewFPFHForm;
