import React              from 'react';
import {Col, Row, Select} from "antd";
import moment             from "moment";

class CalendarHeader extends React.Component {
    constructor(props) {
        super(props);
        this.currentMonth = moment();
        this.previousMonth = moment().subtract(1, 'months');

        this.monthOptions = [(
            <Select.Option
                className="month-item"
                value={this.currentMonth.format("MM")}
                key={0}
            >
                {this.currentMonth.format("MM")}
            </Select.Option>
        ), (
            <Select.Option
                className="month-item"
                value={this.previousMonth.format("MM")}
                key={1}
            >
                {this.previousMonth.format("MM")}
            </Select.Option>
        )];

        this.yearOptions = this.currentMonth.month() === 0 ?
            [(
                <Select.Option
                    className="year-item"
                    value={this.previousMonth.format("YYYY")}
                    key={0}
                >
                    {this.previousMonth.format("YYYY")}
                </Select.Option>
            ), (
                <Select.Option
                    className="year-item"
                    value={this.currentMonth.format("YYYY")}
                    key={1}
                >
                    {this.currentMonth.format("YYYY")}
                </Select.Option>
            )]
            :
            [(
                <Select.Option
                    className="year-item"
                    value={this.currentMonth.format("YYYY")}
                >
                    {this.currentMonth.format("YYYY")}
                </Select.Option>
            )];

        //Binding
        this.onChangeMonth = this.onChangeMonth.bind(this);
    }

    onChangeMonth(selectedMonth) {
        let newValue = moment(selectedMonth, "MM");
        this.props.handleChangeCalendarMonth();
        if (newValue.month() === this.currentMonth.month()) {
            newValue = this.currentMonth;
        } else if (newValue.month() === this.previousMonth.month()) {
            newValue = this.previousMonth;
        }

        if (newValue.month() !== this.props.value.month()) {
            this.props.handleClearSelectedDate();
            this.props.onChange(newValue);
        }
    }

    render() {
        return (
            <div className="mb-2">
                <Row className="justify-content-end">
                    <Col className="mr-2">
                        <span>Tháng:</span>
                    </Col>
                    <Col className="mr-2">
                        <Select
                            size="small"
                            dropdownMatchSelectWidth={false}
                            value={this.props.value.format("MM")}
                            onChange={this.onChangeMonth}
                        >
                            {this.monthOptions}
                        </Select>
                    </Col>
                    <Col>
                        <Select
                            size="small"
                            dropdownMatchSelectWidth={false}
                            className="my-year-select"
                            // disabled={true}
                            value={this.props.value.format("YYYY")}
                        >
                            {this.yearOptions}
                        </Select>
                    </Col>
                </Row>
            </div>
        );
    }
}

export default CalendarHeader;