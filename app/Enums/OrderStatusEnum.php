<?php

namespace App\Enums;

enum OrderStatusEnum: string
{
    case Draft='draft';
    case Paid='paid';
    case Shipped='shipped';
    case Delivered='delivered';
    case Cancelled='cancelled';


    public static function labels()
    {
        return[
            self::Draft->value=>__('Draft'),
            self::Delivered->value=>__('Delivered'),
            self::Cancelled->value=>__('Cancelled'),
            self::Shipped->value=>__('Shipped'),
            self::Paid->value=>__('Paid'),
        ];
    }
}
