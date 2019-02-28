var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Table, Column, Model, DataType, ForeignKey } from 'sequelize-typescript';
import { User } from './../user/main';
import { Organization } from './../organization/main';
var ɵ0 = function () { return Organization; };
var WidgetAppointmentSettings = /** @class */ (function (_super) {
    __extends(WidgetAppointmentSettings, _super);
    function WidgetAppointmentSettings() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    __decorate([
        ForeignKey(ɵ0),
        Column({
            type: DataType.INTEGER,
            primaryKey: true,
            allowNull: false
        }),
        __metadata("design:type", Number)
    ], WidgetAppointmentSettings.prototype, "organization_id", void 0);
    __decorate([
        Column({
            type: DataType.BOOLEAN,
            allowNull: false,
            defaultValue: true
        }),
        __metadata("design:type", String)
    ], WidgetAppointmentSettings.prototype, "is_enabled", void 0);
    __decorate([
        Column({
            type: DataType.STRING(200),
            allowNull: false
        }),
        __metadata("design:type", String)
    ], WidgetAppointmentSettings.prototype, "success_text", void 0);
    WidgetAppointmentSettings = __decorate([
        Table({
            timestamps: false
        })
    ], WidgetAppointmentSettings);
    return WidgetAppointmentSettings;
}(Model));
export { WidgetAppointmentSettings };
var ɵ1 = function () { return User; }, ɵ2 = function () { return Organization; }, ɵ3 = function () { return User; };
var WidgetAppointmentRequest = /** @class */ (function (_super) {
    __extends(WidgetAppointmentRequest, _super);
    function WidgetAppointmentRequest() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    __decorate([
        ForeignKey(ɵ1),
        Column({
            type: 'UNIQUEIDENTIFIER',
            allowNull: true,
            primaryKey: true,
            defaultValue: DataType.UUIDV4,
        }),
        __metadata("design:type", String)
    ], WidgetAppointmentRequest.prototype, "id", void 0);
    __decorate([
        ForeignKey(ɵ2),
        Column({
            type: DataType.INTEGER,
            allowNull: false
        }),
        __metadata("design:type", Number)
    ], WidgetAppointmentRequest.prototype, "organization_id", void 0);
    __decorate([
        Column({
            type: DataType.STRING(100),
            allowNull: false,
            validate: {
                len: [1, 100]
            }
        }),
        __metadata("design:type", String)
    ], WidgetAppointmentRequest.prototype, "fullname", void 0);
    __decorate([
        Column({
            type: DataType.STRING(20),
            allowNull: false
        }),
        __metadata("design:type", String)
    ], WidgetAppointmentRequest.prototype, "phone", void 0);
    __decorate([
        Column({
            type: DataType.DATEONLY,
            allowNull: false
        }),
        __metadata("design:type", String)
    ], WidgetAppointmentRequest.prototype, "date", void 0);
    __decorate([
        Column({
            type: DataType.TIME,
            allowNull: false
        }),
        __metadata("design:type", String)
    ], WidgetAppointmentRequest.prototype, "time", void 0);
    __decorate([
        ForeignKey(ɵ3),
        Column({
            type: 'UNIQUEIDENTIFIER',
            allowNull: false
        }),
        __metadata("design:type", String)
    ], WidgetAppointmentRequest.prototype, "provider_id", void 0);
    WidgetAppointmentRequest = __decorate([
        Table({
            timestamps: true
        })
    ], WidgetAppointmentRequest);
    return WidgetAppointmentRequest;
}(Model));
export { WidgetAppointmentRequest };
export { ɵ0, ɵ1, ɵ2, ɵ3 };
//# sourceMappingURL=appointment.js.map