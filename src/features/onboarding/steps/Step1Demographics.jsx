import Input from '../../../components/Input';
import Select from '../../../components/Select';
import { GENDERS } from '../schema';

export default function Step1Demographics({ data, errors = {}, onChange }) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-fg">Basic Information</h2>
        <p className="text-xs text-muted">
          Your age, gender, and weight help calculate accurate calorie and nutritional guidelines.
        </p>
      </div>

      <Input
        id="onboarding-age"
        label="Age (years)"
        type="number"
        min="10"
        max="100"
        value={data.age ?? ''}
        onChange={(e) => onChange('age', e.target.value === '' ? '' : Number(e.target.value))}
        error={errors.age}
        placeholder="e.g. 28"
        required
      />

      <Select
        id="onboarding-gender"
        label="Biological Sex / Gender"
        value={data.gender || ''}
        onChange={(e) => onChange('gender', e.target.value)}
        error={errors.gender}
        required
      >
        <option value="" disabled>
          Select gender
        </option>
        {GENDERS.map((g) => (
          <option key={g.value} value={g.value}>
            {g.label}
          </option>
        ))}
      </Select>

      <Input
        id="onboarding-weight"
        label="Weight (kg)"
        type="number"
        min="20"
        max="300"
        step="0.5"
        value={data.weightKg ?? ''}
        onChange={(e) =>
          onChange('weightKg', e.target.value === '' ? '' : Number(e.target.value))
        }
        error={errors.weightKg}
        placeholder="e.g. 70"
        required
      />
    </div>
  );
}
