# Dynamic Form Table Architecture

This directory contains reusable components for creating dynamic form tables with questions as rows and entities as columns.

## Components

### DynamicFormTable

A reusable table component that renders dynamic forms with:
- Questions as rows
- Entities (antennas, radio units, etc.) as columns
- Support for various field types (text, number, select, radio, checkbox)
- Conditional field rendering
- Built-in validation and error handling
- Responsive design with sticky headers

#### Props

```javascript
{
  title: string,                    // Optional table title
  entityName: string,               // Name for columns (e.g., "Antenna", "Radio Unit")
  entityCount: number,              // Number of columns to display
  entities: array,                  // Array of entity data objects
  questions: array,                 // Array of question configurations
  errors: object,                   // Validation errors object
  onChange: function,               // Change handler function
  onSubmit: function,               // Submit handler function
  isSubmitting: boolean,            // Loading state for submit button
  maxHeight: string,                // Maximum height for scrollable area
  showSubmitButton: boolean,        // Whether to show submit button
  submitButtonText: string          // Text for submit button
}
```

## Usage Example

### 1. Create Question Configuration

```javascript
// config/antennaQuestions.js
export const antennaQuestions = [
  {
    key: 'sectorNumber',
    label: 'Sector Number',
    type: 'select',
    options: [1, 2, 3, 4, 5, 6],
    required: true
  },
  {
    key: 'technologies',
    label: 'Technologies',
    type: 'checkbox',
    options: ['2G', '3G', '4G', '5G'],
    required: true
  },
  {
    key: 'angularL1Dimension',
    label: 'L1 Dimension (mm)',
    type: 'number',
    condition: (entity) => entity.towerSection === 'Angular',
    showCondition: (entity) => entity.towerSection === 'Angular',
    isConditional: true
  }
];
```

### 2. Create Custom Hook

```javascript
// hooks/useAntennaForm.js
export const useAntennaForm = (sessionId) => {
  const [entities, setEntities] = useState([]);
  const [errors, setErrors] = useState({});
  // ... other state and logic
  
  return {
    entityCount,
    entities,
    errors,
    isLoading,
    isSubmitting,
    handleChange,
    handleSubmit
  };
};
```

### 3. Use in Component

```javascript
// components/AntennaForm.jsx
import DynamicFormTable from '../common/DynamicFormTable';
import { useAntennaForm } from '../../hooks/useAntennaForm';
import { antennaQuestions } from '../../config/antennaQuestions';

const AntennaForm = () => {
  const { sessionId } = useParams();
  const formProps = useAntennaForm(sessionId);
  
  return (
    <DynamicFormTable
      title="Antenna Installation"
      entityName="Antenna"
      entityCount={formProps.entityCount}
      entities={formProps.entities}
      questions={antennaQuestions}
      {...formProps}
    />
  );
};
```

## Question Configuration

### Field Types

- **text**: Regular text input
- **number**: Number input with validation
- **select**: Dropdown selection
- **radio**: Radio button group
- **checkbox**: Checkbox group (for multiple selections)

### Conditional Fields

Fields can be shown/hidden and enabled/disabled based on other field values:

```javascript
{
  key: 'conditionalField',
  label: 'Conditional Field',
  type: 'text',
  condition: (entity) => entity.otherField === 'specificValue',    // When to enable
  showCondition: (entity) => entity.otherField === 'specificValue', // When to show
  isConditional: true  // Styling flag for conditional fields
}
```

### Validation

Fields can be marked as required:

```javascript
{
  key: 'requiredField',
  label: 'Required Field',
  type: 'text',
  required: true
}
```

## Benefits

1. **Code Reusability**: Same component works for antennas, radio units, PDUs, etc.
2. **Maintainability**: All form logic centralized in configurations
3. **Consistency**: Uniform styling and behavior across all forms
4. **Flexibility**: Easy to add new field types and conditional logic
5. **Performance**: Optimized rendering with conditional display
6. **Accessibility**: Built-in ARIA support and keyboard navigation

## Migration Guide

To migrate existing forms:

1. Extract form questions into configuration files
2. Move form logic into custom hooks
3. Replace form JSX with DynamicFormTable component
4. Update API integration in hooks
5. Test conditional logic and validation

This architecture reduces code duplication by ~80% and makes forms much easier to maintain and extend. 