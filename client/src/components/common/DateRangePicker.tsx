import React from 'react';
import { Form, Row, Col } from 'react-bootstrap';
import { useUnifiedSettings } from '../../hooks/useUnifiedSettings';

interface DateRangePickerProps {
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
}

const DateRangePicker: React.FC<DateRangePickerProps> = ({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange
}) => {
  const { settings } = useUnifiedSettings();

  return (
    <Row className={`date-range-picker theme-${settings?.theme ?? 'light'}`}>
      <Col>
        <Form.Group>
          <Form.Label>From</Form.Label>
          <Form.Control
            type="date"
            value={startDate}
            onChange={(e) => onStartDateChange(e.target.value)}
            max={endDate || undefined}
          />
        </Form.Group>
      </Col>
      <Col>
        <Form.Group>
          <Form.Label>To</Form.Label>
          <Form.Control
            type="date"
            value={endDate}
            onChange={(e) => onEndDateChange(e.target.value)}
            min={startDate || undefined}
          />
        </Form.Group>
      </Col>
    </Row>
  );
};

export default DateRangePicker;