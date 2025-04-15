import React, { useState, useMemo } from 'react';
import { Card, Button, Badge, Alert } from 'react-bootstrap';
import { Category } from '../../../common/types';
import CategoryTreeItem from '../../Categories/CategoryTreeItem';
import { CategoryService } from '../../../services/CategoryService';

interface CategoriesWidgetProps {
    categories: Category[];
    onAddCategory: () => void;
    onEditCategory: (category: Category) => void;
    onDeleteCategory: (id: number) => void;
    currencySymbol: string;
}

const CategoriesWidget: React.FC<CategoriesWidgetProps> = ({
    categories,
    onAddCategory,
    onEditCategory,
    onDeleteCategory,
    currencySymbol
}) => {
    const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all');
    const [showAll, setShowAll] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);

    const categoryTree = useMemo(() => {
        const filtered = filter === 'all' 
            ? categories 
            : categories.filter(c => c.type === filter);
        return new CategoryService().buildCategoryTree(filtered);
    }, [categories, filter]);

    const stats = {
        total: categories.length,
        income: categories.filter(c => c.type === 'income').length,
        expense: categories.filter(c => c.type === 'expense').length
    };

    const displayedCategories = useMemo(() => {
        const filtered = categoryTree;
        if (!isExpanded) {
            return filtered.slice(0, 4);
        }
        return filtered;
    }, [categoryTree, isExpanded]);

    return (
        <Card className="border-0 shadow-sm mb-4">
            <Card.Header className="bg-white border-0 p-3">
                <div className="d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center gap-2">
                        <h6 className="mb-0">Categories</h6>
                        <Badge pill bg="light" className="text-dark">
                            {stats.total}
                        </Badge>
                    </div>
                    <div className="d-flex gap-2">
                        <Button
                            variant="light"
                            size="sm"
                            className="btn-icon"
                            onClick={() => setIsExpanded(!isExpanded)}
                        >
                            <i className={`bi bi-${isExpanded ? 'chevron-up' : 'chevron-down'}`}></i>
                        </Button>
                        <Button
                            variant="primary"
                            size="sm"
                            onClick={onAddCategory}
                            className="btn-icon"
                        >
                            <i className="bi bi-plus-lg"></i>
                        </Button>
                    </div>
                </div>
            </Card.Header>
            
            <div className={`category-widget-body ${isExpanded ? 'expanded' : ''}`}>
                <div className="category-filters px-3 py-2 border-bottom">
                    <div className="btn-group btn-group-sm w-100">
                        {['all', 'income', 'expense'].map((type) => (
                            <Button
                                key={type}
                                variant={filter === type ? 'primary' : 'outline-primary'}
                                onClick={() => setFilter(type as typeof filter)}
                                className="flex-fill"
                            >
                                <i className={`bi bi-${type === 'all' ? 'grid' : type === 'income' ? 'arrow-up' : 'arrow-down'} me-1`}></i>
                                {type}
                                <span className="ms-1 badge rounded-pill bg-light text-dark">
                                    {type === 'all' ? stats.total : type === 'income' ? stats.income : stats.expense}
                                </span>
                            </Button>
                        ))}
                    </div>
                </div>

                <div className={`category-list ${isExpanded ? '' : 'compact'}`}>
                    {displayedCategories.map(category => (
                        <div key={category.id} className="category-item p-2 border-bottom">
                            <div className="d-flex align-items-center">
                                <div 
                                    className="category-color me-2"
                                    style={{ 
                                        backgroundColor: category.color,
                                        width: '12px',
                                        height: '12px',
                                        borderRadius: '3px'
                                    }}
                                />
                                <span className="category-name flex-grow-1">{category.name}</span>
                                <Badge 
                                    bg={category.type === 'income' ? 'success' : 'danger'}
                                    className="ms-2"
                                >
                                    {category.type}
                                </Badge>
                            </div>
                        </div>
                    ))}
                </div>

                {!isExpanded && categoryTree.length > 4 && (
                    <div className="text-center p-2 border-top">
                        <Button
                            variant="link"
                            size="sm"
                            onClick={() => setIsExpanded(true)}
                        >
                            View {categoryTree.length - 4} more
                        </Button>
                    </div>
                )}
            </div>
        </Card>
    );
};

export default CategoriesWidget;
