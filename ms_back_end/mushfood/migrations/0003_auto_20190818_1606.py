# Generated by Django 2.2.4 on 2019-08-18 14:06

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('mushfood', '0002_auto_20190815_2248'),
    ]

    operations = [
        migrations.AlterField(
            model_name='recipeimage',
            name='image',
            field=models.ImageField(editable=False, upload_to='pic_folder/'),
        ),
    ]
