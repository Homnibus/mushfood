# Generated by Django 2.2.4 on 2019-08-20 17:01

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('mushfood', '0004_auto_20190818_1703'),
    ]

    operations = [
        migrations.AlterField(
            model_name='recipeimage',
            name='recipe',
            field=models.OneToOneField(editable=False, on_delete=django.db.models.deletion.CASCADE, related_name='recipe_image', to='mushfood.Recipe'),
        ),
    ]
