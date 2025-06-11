
import React from 'react';
import { Calendar, DollarSign, Mail, Phone, Link2, Hash, FileText, Upload } from 'lucide-react';

interface FieldIconProps {
  type: string;
}

export const FieldIcon: React.FC<FieldIconProps> = ({ type }) => {
  switch (type) {
    case 'email': return <Mail className="w-3.5 h-3.5 text-blue-500" />;
    case 'phone': return <Phone className="w-3.5 h-3.5 text-green-500" />;
    case 'url': return <Link2 className="w-3.5 h-3.5 text-purple-500" />;
    case 'number': return <Hash className="w-3.5 h-3.5 text-orange-500" />;
    case 'currency': return <DollarSign className="w-3.5 h-3.5 text-green-600" />;
    case 'date': return <Calendar className="w-3.5 h-3.5 text-blue-600" />;
    case 'textarea':
    case 'rich_text': return <FileText className="w-3.5 h-3.5 text-gray-500" />;
    case 'file_attachment': return <Upload className="w-3.5 h-3.5 text-indigo-500" />;
    default: return null;
  }
};
