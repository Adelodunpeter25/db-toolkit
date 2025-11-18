import { useState } from 'react';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Button } from '../common/Button';

export function ConnectionModal({ isOpen, onClose, onSave }) {
  const [formData, setFormData] = useState({
    name: '',
    db_type: 'postgresql',
    host: 'localhost',
    port: 5432,
    database: '',
    username: '',
    password: '',
  });

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSave(formData);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="New Connection">
      <form onSubmit={handleSubmit}>
        <Input
          label="Connection Name"
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          required
        />

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Database Type
          </label>
          <select
            value={formData.db_type}
            onChange={(e) => handleChange('db_type', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          >
            <option value="postgresql">PostgreSQL</option>
            <option value="mysql">MySQL</option>
            <option value="sqlite">SQLite</option>
            <option value="mongodb">MongoDB</option>
          </select>
        </div>

        {formData.db_type !== 'sqlite' && (
          <>
            <Input
              label="Host"
              value={formData.host}
              onChange={(e) => handleChange('host', e.target.value)}
            />
            <Input
              label="Port"
              type="number"
              value={formData.port}
              onChange={(e) => handleChange('port', parseInt(e.target.value))}
            />
          </>
        )}

        <Input
          label="Database"
          value={formData.database}
          onChange={(e) => handleChange('database', e.target.value)}
          required
        />

        {formData.db_type !== 'sqlite' && (
          <>
            <Input
              label="Username"
              value={formData.username}
              onChange={(e) => handleChange('username', e.target.value)}
            />
            <Input
              label="Password"
              type="password"
              value={formData.password}
              onChange={(e) => handleChange('password', e.target.value)}
            />
          </>
        )}

        <div className="flex gap-2 justify-end mt-6">
          <Button variant="outline" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button type="submit">Create Connection</Button>
        </div>
      </form>
    </Modal>
  );
}
