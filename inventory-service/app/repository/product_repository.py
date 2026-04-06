from app.models.product import Product

class productRepository:
    """
    Repository xử lý truy vấn Product
    """
    @staticmethod
    def get_product_by_id(product_id: int) -> Product:
        return Product.query.get(product_id)

    @staticmethod
    def get_by_ids(ids):
        return Product.query.filter(Product.id.in_(ids)).all()
    
    @staticmethod
    def get_all():
        return Product.query.all()